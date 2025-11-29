using System.Security.Cryptography;
using System.Text;

namespace HrPayroll.OtpService.Services;

public class SecureOtpGenerator
{
    public string Generate(int length = 6)
    {
        const string digits = "0123456789";
        var result = new StringBuilder(length);
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[length];
        
        rng.GetBytes(bytes);

        for (var i = 0; i < length; i++)
        {
            var idx = bytes[i] % digits.Length;
            result.Append(digits[idx]);
        }
        return result.ToString();
    }
}