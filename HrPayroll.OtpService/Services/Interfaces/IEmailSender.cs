namespace HrPayroll.OtpService.Services.Interfaces;

public interface IEmailSender
{
    Task SendOtpEmailAsync(string toEmail, string otpCode, DateTime expiresAtUtc);
}
