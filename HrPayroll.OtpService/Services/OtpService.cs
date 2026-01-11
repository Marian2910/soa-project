using System.Collections.Concurrent;
using HrPayroll.OtpService.Models;
using HrPayroll.OtpService.Services.Interfaces;
using HrPayroll.OtpService.Services.Messaging;

namespace HrPayroll.OtpService.Services;

public class OtpService : IOtpService
{
    private readonly SecureOtpGenerator _generator;
    private readonly IMessageProducer _messageProducer;
    private readonly KafkaProducer _kafkaProducer;
    private readonly int _expirySeconds;

    private readonly ConcurrentDictionary<string, OtpEntry> _otpStore = new();

    public OtpService(SecureOtpGenerator generator, IMessageProducer messageProducer, KafkaProducer kafkaProducer, IConfiguration config)
    {
        _generator = generator;
        _messageProducer = messageProducer;
        _kafkaProducer = kafkaProducer;
        _expirySeconds = config.GetValue<int>("OtpSettings:ExpirySeconds", 120);
    }

    private static string BuildKey(string userId, string transactionId)
        => $"{userId}:{transactionId}";

    public async Task<OtpResponseDto> IssueOtpAsync(string userId, string? email, string transactionId, string purpose)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("UserId is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(transactionId)) throw new ArgumentException("TransactionId is required.", nameof(transactionId));
        if (string.IsNullOrWhiteSpace(purpose)) purpose = "transaction_approval";

        var code = _generator.Generate();
        var expiry = DateTime.UtcNow.AddSeconds(_expirySeconds);

        var entry = new OtpEntry
        {
            Code = code,
            Expiry = expiry,
            Purpose = purpose
        };

        var key = BuildKey(userId, transactionId);
        _otpStore[key] = entry;

        if (!string.IsNullOrWhiteSpace(email))
        {
            var eventMessage = new 
            {
                Type = "OtpGenerated",
                UserId = userId,
                Email = email,
                TransactionId = transactionId,
                Code = code,
                Expiry = expiry,
                Timestamp = DateTime.UtcNow
            };

            await _messageProducer.SendMessageAsync(eventMessage, "otp.generated");
        }

        return new OtpResponseDto
        {
            TransactionId = transactionId,
            ExpiresInSeconds = _expirySeconds,
            ExpiresAt = expiry,
            SentByEmail = !string.IsNullOrWhiteSpace(email)
        };
    }

    public async Task ValidateOtpAsync(string userId, string transactionId, string code)
    {
        var key = BuildKey(userId, transactionId);

        if (!_otpStore.TryGetValue(key, out var entry))
        {
            await _kafkaProducer.ProduceAsync(userId, transactionId, "FAILED_NOT_FOUND");
            throw new KeyNotFoundException("OTP not found or expired.");
        }

        if (DateTime.UtcNow > entry.Expiry)
        {
            _otpStore.TryRemove(key, out _);
            await _kafkaProducer.ProduceAsync(userId, transactionId, "FAILED_EXPIRED");
            throw new Exception("OTP has expired.");
        }

        if (!string.Equals(entry.Code, code, StringComparison.Ordinal))
        {
            await _kafkaProducer.ProduceAsync(userId, transactionId, "FAILED_INVALID_CODE");
            throw new Exception("Invalid OTP.");
        }

        _otpStore.TryRemove(key, out _);
        
        await _kafkaProducer.ProduceAsync(userId, transactionId, "SUCCESS");
    }
}