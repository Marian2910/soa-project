namespace HrPayroll.Profile.Models;

public class UserProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Iban { get; set; } = string.Empty;
}