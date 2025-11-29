using Otp.Api.Models;

namespace Otp.Api.Services.Interfaces;

public interface IOtpService
{
    Task<OtpResponseDto> IssueOtpAsync(string userId, string? email, string transactionId, string purpose);
    Task ValidateOtpAsync(string userId, string transactionId, string code);
}
