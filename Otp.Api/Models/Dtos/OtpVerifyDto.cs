namespace Otp.Api.Models;

public class OtpVerifyDto
{
    public string TransactionId { get; set; } = default!;
    public string Code { get; set; } = default!;
}
