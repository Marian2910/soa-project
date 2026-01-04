using HrPayroll.Auth.Models;

namespace HrPayroll.Auth.Services;

public interface IAuthService
{
    Task<object> RegisterAsync(RegisterDto request);
    Task<object> LoginAsync(LoginDto request);
}