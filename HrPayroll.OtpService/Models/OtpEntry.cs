namespace HrPayroll.OtpService.Models;

public class OtpEntry {
    public string Code { get; set; } = default!;
    public DateTime Expiry { get; set; }
    public string Purpose { get; set; } = default!;
}