using HrPayroll.Auth.Exceptions;
using HrPayroll.Auth.Models;
using HrPayroll.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HrPayroll.Auth.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    private string GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value
        ?? throw new UnauthorizedAccessException("User not authenticated.");

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        var profile = await _profileService.GetProfileAsync(userId);
        return Ok(profile);
    }

    [HttpGet("financials")]
    public async Task<IActionResult> GetMyFinancials()
    {
        var userId = GetUserId();
        var financials = await _profileService.GetFinancialsAsync(userId);
        
        if (financials == null)
            return NotFound(new { message = "Financial records not found." });

        return Ok(financials);
    }

    [HttpPost("initiate-update")]
    public async Task<IActionResult> InitiateUpdate([FromBody] InitiateUpdateDto request)
    {
        var userId = GetUserId();
        InitiateUpdateResponseDto responseDto =  await _profileService.InitiateIbanUpdateAsync(userId, request.NewIban);

        return Ok(new { responseDto });
    }

    [HttpPost("finalize-update")]
    public async Task<IActionResult> FinalizeUpdate([FromBody] OtpVerifyRequest request)
    {
        var userId = GetUserId();

        try
        {
            await _profileService.FinalizeIbanUpdateAsync(userId, request.TransactionId, request.Code);
            return Ok(new { message = "IBAN updated successfully." });
        }
        catch (OtpExpiredException ex)
        {
            return BadRequest(new { type = "EXPIRED", message = ex.Message });
        }
        catch (OtpInvalidException ex)
        {
            return BadRequest(new { type = "INVALID", message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { type = "GENERAL", message = ex.Message });
        }
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto request)
    {
        var userId = GetUserId();
        await _profileService.ResendOtpAsync(userId, request.TransactionId);
        return Ok(new { message = "OTP resent." });
    }
}