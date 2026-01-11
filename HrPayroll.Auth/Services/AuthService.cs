using HrPayroll.Auth.Exceptions;
using HrPayroll.Auth.Models;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace HrPayroll.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IMongoCollection<User> _users;
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;

        var mongoUrl = config["MongoDb:ConnectionString"] ?? "mongodb://admin:password@localhost:27017";
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");

        _users = db.GetCollection<User>("Users");
    }

    public async Task<object> RegisterAsync(RegisterDto request)
    {
        var existing = await _users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
        if (existing != null) throw new BadRequestException("User already exists.");

        var hashedPassword = request.Password;
        
        var user = new User
        {
            Email = request.Email,
            PasswordHash = hashedPassword,
            FullName = request.FullName,
            Iban = request.Iban,
            Role = "Employee"
        };

        await _users.InsertOneAsync(user);

        return new { message = "User registered successfully." };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto request)
    {
        var user = await _users.Find(u => u.Email == request.Username).FirstOrDefaultAsync();
        if (user == null || user.PasswordHash != request.Password)
            throw new UnauthorizedException("Invalid credentials.");

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("fullName", user.FullName),
            new Claim("role", user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResponseDto
        {
            Token = jwt,
            Id = user.Id,
            FullName = user.FullName,
            Iban = user.Iban
        };
    }
}
