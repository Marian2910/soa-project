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

builder.Services.AddHttpClient("OtpClient", client =>
{
    var otpUrl = builder.Configuration["Services:OtpServiceUrl"];
    client.BaseAddress = new Uri(otpUrl);
});

builder.Services.AddScoped<IProfileService, ProfileService>(); 
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHostedService<KafkaAuditConsumer>();
builder.Services.AddHostedService<TransactionCleanupService>();
builder.Services.AddHostedService<FraudKafkaConsumer>();

builder.Services.AddSingleton<FraudAlertService>();

builder.Services.AddHttpContextAccessor();

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

app.UseCors("AllowAll");

app.UseMiddleware<ExceptionMiddleware>();

app.UseWebSockets();

app.UseAuthentication();

app.UseAuthorization();

app.Map("/ws/fraud-alerts", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var socket = await context.WebSockets.AcceptWebSocketAsync();
        var handler = context.RequestServices.GetRequiredService<FraudAlertService>();
        await handler.HandleClientAsync(socket);
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.MapControllers();

app.Run();