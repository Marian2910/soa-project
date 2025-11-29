using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Otp.Auth.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Otp.Auth.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto request)
    {
        // 1. Validate User (Simulated DB for now)
        if (request.Username != "admin" || request.Password != "password")
        {
            return Unauthorized("Invalid credentials.");
        }

        // 2. Create Claims (User Data inside the Token)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, "101"), // User ID
            new Claim(JwtRegisteredClaimNames.Email, "rigiliw468@datehype.com"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // 3. Sign the Token
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { Token = jwt });
    }
}