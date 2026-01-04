using System.Text;
using HrPayroll.Auth.Middleware;
using HrPayroll.Auth.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var jwtSection = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

// HttpClient for OTP microservice
builder.Services.AddHttpClient("OtpClient", client =>
{
    var otpUrl = builder.Configuration["Services:OtpServiceUrl"] ?? "http://localhost:5002";
    client.BaseAddress = new Uri(otpUrl);
});

builder.Services.AddScoped<IProfileService, ProfileService>(); 
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddHttpClient("OtpClient", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:OtpServiceUrl"] ?? "http://localhost:5002");
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();