using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HrPayroll.Auth.Models;
using System.Security.Claims;
using HrPayroll.Profile.Models;

namespace HrPayroll.Auth.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Protected by JWT
public class ProfileController : ControllerBase
{
    private readonly IMongoCollection<User> _users;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public ProfileController(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClient = httpClientFactory.CreateClient("OtpClient");

        // Connect to the SAME MongoDB as AuthService
        var mongoUrl = _config["MongoDb:ConnectionString"] ?? "mongodb://admin:password@localhost:27017";
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");
        _users = db.GetCollection<User>("Users");
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound("User not found.");

        return Ok(new UserProfileDto
        {
            FullName = user.FullName,
            Email = user.Email,
            Iban = user.Iban
        });
    }

    [HttpPost("update-iban")]
    public async Task<IActionResult> UpdateIban([FromBody] UpdateIbanRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // 1. Verify OTP with OtpService
        // We make an internal HTTP call to the OTP microservice
        var verifyPayload = new OtpVerifyRequest 
        { 
            TransactionId = request.TransactionId, 
            Code = request.OtpCode 
        };

        var response = await _httpClient.PostAsJsonAsync("/api/otp/verify", verifyPayload);

        if (!response.IsSuccessStatusCode)
        {
            return BadRequest(new { message = "Invalid or expired OTP. Update rejected." });
        }

        // 2. If we get here, OTP is valid. Update the Database.
        var update = Builders<User>.Update.Set(u => u.Iban, request.NewIban);
        await _users.UpdateOneAsync(u => u.Id == userId, update);

        return Ok(new { message = "IBAN updated successfully!" });
    }
}