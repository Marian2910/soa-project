using HrPayroll.Auth.Models;
using HrPayroll.Auth.Services;
using Microsoft.AspNetCore.Mvc;
using Confluent.Kafka;
using System.Text.Json;

namespace HrPayroll.Auth.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (!string.IsNullOrEmpty(result.Id))
        {
            _ = PublishLoginEvent(result.Id);
        }

        return Ok(result);
    }

    private async Task PublishLoginEvent(string userId)
    {
        try
        {
            var config = new ProducerConfig { BootstrapServers = _configuration["Kafka:BootstrapServers"] };
            using var producer = new ProducerBuilder<Null, string>(config).Build();

            var eventData = new
            {
                EventType = "USER_LOGIN",
                UserId = userId,
                Timestamp = DateTime.UtcNow
            };

            await producer.ProduceAsync("audit-logs", new Message<Null, string> { Value = JsonSerializer.Serialize(eventData) });
        }
        catch (Exception ex) { Console.WriteLine($"Login Log Failed: {ex.Message}"); }
    }
}