using HrPayroll.Auth.Models;
using HrPayroll.Profile.Models;

namespace HrPayroll.Auth.Services;

public interface IProfileService
{
    Task<UserProfileDto> GetProfileAsync(string userId);
    Task<EmployeeFinancials?> GetFinancialsAsync(string userId);
    Task<string> RequestIbanChangeAsync(string userId, string newIban);
    Task UpdateIbanAsync(string userId, string newIban, string transactionId, string otpCode);
}
