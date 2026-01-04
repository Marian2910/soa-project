using HrPayroll.Auth.Models;
using HrPayroll.Profile.Models;

namespace HrPayroll.Auth.Services;

public interface IProfileService
{
    Task<UserProfileDto> GetProfileAsync(string userId);
    Task<EmployeeFinancials?> GetFinancialsAsync(string userId);
    Task<string> InitiateIbanUpdateAsync(string userId, string newIban);
    Task FinalizeIbanUpdateAsync(string userId, string transactionId, string otpCode);
    Task ResendOtpAsync(string userId, string transactionId);
}
