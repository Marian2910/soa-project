namespace HrPayroll.Auth.Models
{
    public class OtpResponseDto
    {
        public string TransactionId { get; set; } = string.Empty;
        public int ExpiresInSeconds { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool SentByEmail { get; set; }
    }
}
