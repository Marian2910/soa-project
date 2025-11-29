using System.Collections.Concurrent;
using System.Reflection;
using HrPayroll.OtpService.Models;
using HrPayroll.OtpService.Services;
using HrPayroll.OtpService.Services.Messaging;
using HrPayroll.OtpService.Services.Interfaces;
using Moq;
using Microsoft.Extensions.Configuration;

namespace Otp.Tests;

public class OtpServiceTests
{
    private readonly SecureOtpGenerator _generator = new();
    private readonly Mock<IMessageProducer> _messageProducerMock = new();

    private OtpService CreateService(int expirySeconds = 120)
    {
        // Create an in-memory configuration to simulate appsettings
        var inMemorySettings = new Dictionary<string, string?> {
            {"OtpSettings:ExpirySeconds", expirySeconds.ToString()},
            {"Kafka:BootstrapServers", "localhost:9092"}
        };
    
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        // Create a real KafkaProducer instance (won't actually connect in tests)
        var kafkaProducer = new KafkaProducer(configuration);

        return new OtpService(_generator, _messageProducerMock.Object, kafkaProducer, configuration);
    }

    [Fact]
    public async Task IssueOtp_ShouldReturnMetadataAndPublishMessage()
    {
        // Arrange
        var service = CreateService(expirySeconds: 120);
        const string userId = "user1";
        const string email = "user1@test.com";
        const string transactionId = "txn-123";

        // Act
        var response = await service.IssueOtpAsync(userId, email, transactionId, "transaction_approval");

        // Assert
        Assert.NotNull(response);
        Assert.Equal(transactionId, response.TransactionId);
        Assert.Equal(120, response.ExpiresInSeconds);
        Assert.True(response.SentByEmail);

        // Verify message was published to "otp.generated" topic
        _messageProducerMock.Verify(
            p => p.SendMessageAsync(It.IsAny<object>(), "otp.generated"),
            Times.Once);
    }

    [Fact]
    public async Task IssueOtp_ShouldThrow_WhenUserIdIsEmpty()
    {
        var service = CreateService();

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.IssueOtpAsync("", "user1@test.com", "txn-1", "transaction_approval"));

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.IssueOtpAsync(null!, "user1@test.com", "txn-1", "transaction_approval"));

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.IssueOtpAsync("   ", "user1@test.com", "txn-1", "transaction_approval"));
    }

    [Fact]
    public async Task ValidateOtp_ShouldSucceed_WhenOtpIsCorrect()
    {
        // Arrange
        var service = CreateService();
        const string userId = "user1";
        const string email = "user1@test.com";
        const string transactionId = "txn-123";

        // Issue OTP
        await service.IssueOtpAsync(userId, email, transactionId, "transaction_approval");

        // Use reflection to get the actual code from the private store
        var field = typeof(OtpService).GetField("_otpStore",
            BindingFlags.NonPublic | BindingFlags.Instance);

        Assert.NotNull(field);

        var store = field!.GetValue(service) as ConcurrentDictionary<string, OtpEntry>;
        Assert.NotNull(store);

        var key = $"{userId}:{transactionId}";
        Assert.True(store!.TryGetValue(key, out var entry));
        Assert.NotNull(entry);

        var actualCode = entry!.Code;

        // Act & Assert - should not throw
        await service.ValidateOtpAsync(userId, transactionId, actualCode);
    }

    [Fact]
    public async Task ValidateOtp_ShouldThrow_WhenOtpIsInvalid()
    {
        // Arrange
        var service = CreateService();
        const string userId = "user1";
        const string email = "user1@test.com";
        const string transactionId = "txn-123";

        await service.IssueOtpAsync(userId, email, transactionId, "transaction_approval");

        // Act
        var ex = await Assert.ThrowsAsync<Exception>(() =>
            service.ValidateOtpAsync(userId, transactionId, "000000"));

        // Assert
        Assert.Equal("Invalid OTP.", ex.Message);
    }

    [Fact]
    public async Task ValidateOtp_ShouldThrow_WhenOtpExpired()
    {
        // Arrange
        var service = CreateService(expirySeconds: 1);
        const string userId = "user1";
        const string email = "user1@test.com";
        const string transactionId = "txn-123";

        await service.IssueOtpAsync(userId, email, transactionId, "transaction_approval");

        // Wait for expiry
        await Task.Delay(1500);

        // Act
        var ex = await Assert.ThrowsAsync<Exception>(() =>
            service.ValidateOtpAsync(userId, transactionId, "whatever"));

        // Assert
        Assert.Equal("OTP has expired.", ex.Message);
    }

    [Fact]
    public async Task ValidateOtp_ShouldThrow_WhenOtpDoesNotExist()
    {
        // Arrange
        var service = CreateService();
        const string userId = "unknown";
        const string transactionId = "txn-123";

        // Act
        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.ValidateOtpAsync(userId, transactionId, "123456"));

        // Assert
        Assert.Equal("OTP not found or expired.", ex.Message);
    }

    [Fact]
    public async Task ValidateOtp_ShouldThrow_WhenOtpWasAlreadyValidated()
    {
        // Arrange
        var service = CreateService();
        const string userId = "user1";
        const string email = "user1@test.com";
        const string transactionId = "txn-123";

        // Issue and get actual code via reflection
        await service.IssueOtpAsync(userId, email, transactionId, "transaction_approval");

        var field = typeof(OtpService).GetField("_otpStore",
            BindingFlags.NonPublic | BindingFlags.Instance);
        var store = (ConcurrentDictionary<string, OtpEntry>)field!.GetValue(service)!;
        var key = $"{userId}:{transactionId}";
        var entry = store[key];
        var code = entry.Code;

        // First validation should succeed
        await service.ValidateOtpAsync(userId, transactionId, code);

        // Second validation should throw "not found"
        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.ValidateOtpAsync(userId, transactionId, code));

        Assert.Equal("OTP not found or expired.", ex.Message);
    }
}
    