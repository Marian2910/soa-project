namespace HrPayroll.OtpService.Models;

public class OtpResponseDto
{
    public string TransactionId { get; set; } = default!;
    public int ExpiresInSeconds { get; set; }
    public bool SentByEmail { get; set; }
}