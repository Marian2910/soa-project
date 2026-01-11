namespace HrPayroll.Auth.Models
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Iban { get; set; } = string.Empty;
    }
}
