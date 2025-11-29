namespace Otp.Api.Services.Interfaces;

public interface IEmailSender
{
    Task SendOtpEmailAsync(string toEmail, string otpCode, DateTime expiresAtUtc);
}
