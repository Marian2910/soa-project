namespace HrPayroll.Auth.Models.DTOs;

public class UpdateIbanRequestDto
{
    public string NewIban { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
}