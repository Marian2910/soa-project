using System.Security.Claims;
using HrPayroll.OtpService.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HrPayroll.OtpService.Models;
using HrPayroll.OtpService.Services.Interfaces;

namespace HrPayroll.OtpService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;

    public OtpController(IOtpService otpService)
    {
        _otpService = otpService;
    }
    
    private (string userId, string? email) GetUserIdentity()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                     ?? User.FindFirstValue("sub") 
                     ?? throw new InvalidOperationException("User id not found in token.");

        var email = User.FindFirstValue(ClaimTypes.Email) 
                    ?? User.FindFirstValue("email");

        return (userId, email);
    }

    /// <summary>
    /// Generate a one-time password for a given authenticated user and transaction.
    /// </summary>
    [HttpPost("request")]
    public async Task<ActionResult<OtpResponseDto>> RequestOtp([FromBody] OtpRequestDto? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.TransactionId))
            return BadRequest(new { errorMessage = "TransactionId is required." });

        var (userId, email) = GetUserIdentity();

        OtpResponseDto otpResponse = await _otpService.IssueOtpAsync(userId, email, request.TransactionId, request.Purpose);

        return Ok(otpResponse);
    }

    /// <summary>
    /// Verify the OTP submitted by the authenticated user for a transaction.
    /// </summary>
    [HttpPost("verify")]
    public async Task<ActionResult<object>> VerifyOtp([FromBody] OtpVerifyDto? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.TransactionId) || string.IsNullOrWhiteSpace(request.Code))
            return BadRequest(new { errorMessage = "TransactionId and Code are required." });

        var (userId, _) = GetUserIdentity();

        try
        {
            await _otpService.ValidateOtpAsync(userId, request.TransactionId, request.Code);
            return Ok(new { success = true, message = "OTP verified successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { errorMessage = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { errorMessage = ex.Message });
        }
    }
}
