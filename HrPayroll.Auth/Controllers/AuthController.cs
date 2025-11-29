using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using HrPayroll.Auth.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HrPayroll.Auth.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IMongoCollection<User> _users;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
        
        // Connect to MongoDB
        // If running locally, it uses localhost. If in Docker, it uses the 'mongo' hostname via Env Vars.
        var connectionString = _configuration["MongoDb:ConnectionString"] ?? "mongodb://admin:password@localhost:27017";
        var client = new MongoClient(connectionString);
        var database = client.GetDatabase("HrPayrollDb");
        _users = database.GetCollection<User>("Users");
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        // 1. Check if user already exists
        var existing = await _users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
        if (existing != null) 
            return BadRequest(new { message = "User already exists." });

        // 2. Create User Object
        var user = new User
        {
            Email = request.Email,
            // In a real app, use BCrypt.HashPassword(request.Password) here!
            PasswordHash = request.Password, 
            FullName = request.FullName,
            Iban = request.Iban,
            Role = "Employee"
        };

        // 3. Save to Mongo
        await _users.InsertOneAsync(user);

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        // 1. Find User in DB
        var user = await _users.Find(u => u.Email == request.Username && u.PasswordHash == request.Password).FirstOrDefaultAsync();
        
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        // 2. Create JWT Claims
        // We put the UserID in "sub" so OtpService can read it later
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("fullName", user.FullName), // Frontend might need this
            new Claim("role", user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // 3. Sign Token
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { Token = jwt, FullName = user.FullName, Iban = user.Iban });
    }
}