namespace HrPayroll.Auth.Models;

public class InitiateUpdateDto
{
    public string NewIban { get; set; } = string.Empty;
}

public class ResendOtpDto
{
    public string TransactionId { get; set; } = string.Empty;
}

public class OtpVerifyRequest
{
    public string TransactionId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}