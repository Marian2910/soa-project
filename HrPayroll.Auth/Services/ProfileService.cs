using HrPayroll.Auth.Models;
using HrPayroll.Profile.Models;
using MongoDB.Driver;
using HrPayroll.Auth.Exceptions;
using System.Net.Http.Json;

namespace HrPayroll.Auth.Services;

public class ProfileService : IProfileService
{
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<EmployeeFinancials> _financials;
    private readonly IMongoCollection<PendingUpdate> _pendingUpdates;
    private readonly HttpClient _otpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProfileService(
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? 
            throw new ArgumentNullException(nameof(httpContextAccessor));

        var mongoUrl = config["MongoDb:ConnectionString"] 
                       ?? "mongodb://admin:password@localhost:27017";
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");

        _users = db.GetCollection<User>("Users");
        _financials = db.GetCollection<EmployeeFinancials>("Financials");
        _pendingUpdates = db.GetCollection<PendingUpdate>("PendingUpdates");

        _otpClient = httpClientFactory.CreateClient("OtpClient");
    }

    public async Task<UserProfileDto> GetProfileAsync(string userId)
    {
        var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null)
            throw new NotFoundException("User not found.");

        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Iban = user.Iban
        };
    }

    public async Task<EmployeeFinancials?> GetFinancialsAsync(string userId)
    {
        return await _financials.Find(f => f.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task<string> InitiateIbanUpdateAsync(string userId, string newIban)
    {
        if (string.IsNullOrWhiteSpace(newIban))
            throw new BadRequestException("New IBAN is required.");

        var transactionId = Guid.NewGuid().ToString("N").ToUpper()[..10];

        var pending = new PendingUpdate
        {
            TransactionId = transactionId,
            UserId = userId,
            NewIban = newIban,
            CreatedAt = DateTime.UtcNow
        };
        await _pendingUpdates.InsertOneAsync(pending);

        var payload = new
        {
            TransactionId = transactionId,
            Purpose = "IBAN Update"
        };

        await CallOtpServiceAsync("/api/otp/request", payload);

        return transactionId;
    }

    public async Task FinalizeIbanUpdateAsync(string userId, string transactionId, string otpCode)
    {
        var pending = await _pendingUpdates
            .Find(p => p.TransactionId == transactionId && p.UserId == userId)
            .FirstOrDefaultAsync();

        if (pending == null)
            throw new NotFoundException("Transaction not found or expired.");

        var verifyPayload = new { TransactionId = transactionId, Code = otpCode };
        await CallOtpServiceAsync("/api/otp/verify", verifyPayload);

        var update = Builders<User>.Update.Set(u => u.Iban, pending.NewIban);
        await _users.UpdateOneAsync(u => u.Id == userId, update);

        await _pendingUpdates.DeleteOneAsync(p => p.Id == pending.Id);
    }

    public async Task ResendOtpAsync(string userId, string transactionId)
    {
        var pending = await _pendingUpdates
            .Find(p => p.TransactionId == transactionId && p.UserId == userId)
            .FirstOrDefaultAsync();

        if (pending == null)
            throw new NotFoundException("Transaction not found.");

        var payload = new { TransactionId = transactionId, Purpose = "Resend OTP" };
        await CallOtpServiceAsync("/api/otp/request", payload);
    }

    private async Task CallOtpServiceAsync(string endpoint, object payload)
    {
        var accessToken = _httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();
        
        var requestMessage = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = JsonContent.Create(payload)
        };

        if (!string.IsNullOrEmpty(accessToken))
        {
            requestMessage.Headers.Add("Authorization", accessToken);
        }

        var response = await _otpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"OTP Service Error: {error}");
        }
    }
}