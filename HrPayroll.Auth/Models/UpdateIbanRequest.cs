namespace HrPayroll.Profile.Models;

public class UpdateIbanRequest
{
    public string NewIban { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
}