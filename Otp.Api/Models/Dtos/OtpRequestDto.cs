namespace Otp.Api.Models.Dtos;

public class OtpRequestDto
{
    public string TransactionId { get; set; } = default!;
    public string Purpose { get; set; } = "transaction_approval";
}

