namespace HrPayroll.Auth.Models.DTOs;

public class OtpVerifyRequestDto
{
    public string TransactionId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}