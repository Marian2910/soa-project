using HrPayroll.Auth.Models;
using HrPayroll.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HrPayroll.Profile.Models;

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
        return Ok(financials);
    }

    [HttpPost("request-iban-change")]
    public async Task<IActionResult> RequestIbanChange([FromBody] RequestIbanChangeDto request)
    {
        var userId = GetUserId();
        var transactionId = await _profileService.RequestIbanChangeAsync(userId, request.NewIban);
        return Ok(new { transactionId });
    }

    [HttpPost("update-iban")]
    public async Task<IActionResult> UpdateIban([FromBody] UpdateIbanRequest request)
    {
        var userId = GetUserId();
        await _profileService.UpdateIbanAsync(userId, request.NewIban, request.TransactionId, request.OtpCode);
        return Ok(new { message = "IBAN updated successfully!" });
    }
}