namespace HrPayroll.Profile.Models;

public class OtpVerifyRequest
{
    public string TransactionId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}