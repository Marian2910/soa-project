using System.Security.Claims;
using Otp.Api.Controllers;
using Otp.Api.Models;
using Otp.Api.Models.Dtos;
using Otp.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Otp.Tests;

public class OtpControllerTests
{
    private readonly Mock<IOtpService> _serviceMock;
    private readonly OtpController _controller;

    public OtpControllerTests()
    {
        _serviceMock = new Mock<IOtpService>();

        _controller = new OtpController(_serviceMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = CreateFakeUserPrincipal("user1", "user1@test.com")
                }
            }
        };
    }

    private static ClaimsPrincipal CreateFakeUserPrincipal(string userId, string email)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email)
        };

        var identity = new ClaimsIdentity(claims, "TestAuthType");
        return new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task RequestOtp_ShouldReturnOk_WhenTransactionIdIsValid()
    {
        // Arrange
        const string transactionId = "txn-123";
        var responseDto = new OtpResponseDto
        {
            TransactionId = transactionId,
            ExpiresInSeconds = 120,
            SentByEmail = true
        };

        _serviceMock
            .Setup(s => s.IssueOtpAsync(
                It.IsAny<string>(),         // userId from claims
                It.IsAny<string>(),         // email from claims
                transactionId,
                "transaction_approval"))
            .ReturnsAsync(responseDto);

        var requestDto = new OtpRequestDto
        {
            TransactionId = transactionId,
            Purpose = "transaction_approval"
        };

        // Act
        var actionResult = await _controller.RequestOtp(requestDto);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var resultValue = Assert.IsType<OtpResponseDto>(okResult.Value);

        // Assert
        Assert.Equal(transactionId, resultValue.TransactionId);
        Assert.Equal(120, resultValue.ExpiresInSeconds);
        Assert.True(resultValue.SentByEmail);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RequestOtp_ShouldReturnBadRequest_WhenTransactionIdIsInvalid(string invalidTransactionId)
    {
        // Arrange
        var requestDto = new OtpRequestDto
        {
            TransactionId = invalidTransactionId
        };

        // Act
        var actionResult = await _controller.RequestOtp(requestDto);
        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult.Result);

        var errorMessageProp = badRequest.Value?.GetType().GetProperty("errorMessage");
        var errorMessage = errorMessageProp?.GetValue(badRequest.Value)?.ToString();

        // Assert
        Assert.Equal("TransactionId is required.", errorMessage);
    }

    [Fact]
    public async Task RequestOtp_ShouldReturnBadRequest_WhenRequestIsNull()
    {
        // Act
        var actionResult = await _controller.RequestOtp(null);
        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult.Result);

        var errorMessageProp = badRequest.Value?.GetType().GetProperty("errorMessage");
        var errorMessage = errorMessageProp?.GetValue(badRequest.Value)?.ToString();

        // Assert
        Assert.Equal("TransactionId is required.", errorMessage);
    }

    [Fact]
    public async Task VerifyOtp_ShouldReturnOk_WhenOtpIsValid()
    {
        // Arrange
        const string transactionId = "txn-123";
        const string code = "123456";

        _serviceMock
            .Setup(s => s.ValidateOtpAsync("user1", transactionId, code))
            .Returns(Task.CompletedTask);

        var requestDto = new OtpVerifyDto
        {
            TransactionId = transactionId,
            Code = code
        };

        // Act
        var actionResult = await _controller.VerifyOtp(requestDto);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);

        var successProp = okResult.Value?.GetType().GetProperty("success");
        var messageProp = okResult.Value?.GetType().GetProperty("message");

        var success = (bool)(successProp?.GetValue(okResult.Value) ?? throw new InvalidOperationException());
        var message = messageProp?.GetValue(okResult.Value)?.ToString();

        // Assert
        Assert.True(success);
        Assert.Equal("OTP verified successfully.", message);
    }

    [Theory]
    [InlineData(null, "123456")]
    [InlineData("txn-123", null)]
    [InlineData("", "")]
    public async Task VerifyOtp_ShouldReturnBadRequest_WhenTransactionIdOrCodeInvalid(string transactionId, string code)
    {
        // Arrange
        var requestDto = new OtpVerifyDto
        {
            TransactionId = transactionId,
            Code = code
        };

        // Act
        var actionResult = await _controller.VerifyOtp(requestDto);
        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult.Result);

        var errorMessageProp = badRequest.Value?.GetType().GetProperty("errorMessage");
        var errorMessage = errorMessageProp?.GetValue(badRequest.Value)?.ToString();

        // Assert
        Assert.Equal("TransactionId and Code are required.", errorMessage);
    }

    [Fact]
    public async Task VerifyOtp_ShouldReturnNotFound_WhenOtpDoesNotExist()
    {
        // Arrange
        const string transactionId = "txn-123";
        const string code = "123456";

        _serviceMock
            .Setup(s => s.ValidateOtpAsync("user1", transactionId, code))
            .ThrowsAsync(new KeyNotFoundException("OTP not found for this user and transaction."));

        var requestDto = new OtpVerifyDto
        {
            TransactionId = transactionId,
            Code = code
        };

        // Act
        var actionResult = await _controller.VerifyOtp(requestDto);
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);

        var errorMessageProp = notFoundResult.Value?.GetType().GetProperty("errorMessage");
        var errorMessage = errorMessageProp?.GetValue(notFoundResult.Value)?.ToString();

        // Assert
        Assert.Equal("OTP not found for this user and transaction.", errorMessage);
    }

    [Fact]
    public async Task VerifyOtp_ShouldReturnBadRequest_WhenOtpInvalidOrExpired()
    {
        // Arrange
        const string transactionId = "txn-123";
        const string code = "123456";

        _serviceMock
            .Setup(s => s.ValidateOtpAsync("user1", transactionId, code))
            .ThrowsAsync(new Exception("OTP has expired."));

        var requestDto = new OtpVerifyDto
        {
            TransactionId = transactionId,
            Code = code
        };

        // Act
        var actionResult = await _controller.VerifyOtp(requestDto);
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);

        var errorMessageProp = badRequestResult.Value?.GetType().GetProperty("errorMessage");
        var errorMessage = errorMessageProp?.GetValue(badRequestResult.Value)?.ToString();

        // Assert
        Assert.Equal("OTP has expired.", errorMessage);
    }
}
