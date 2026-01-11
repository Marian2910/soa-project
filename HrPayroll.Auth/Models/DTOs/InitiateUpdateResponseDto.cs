namespace HrPayroll.Auth.Models
{
    public class InitiateUpdateResponseDto
    {
        public string TransactionId { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
