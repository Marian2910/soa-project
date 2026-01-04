using HrPayroll.Auth.Models;
using HrPayroll.Profile.Models;
using MongoDB.Driver;
using HrPayroll.Auth.Exceptions;

namespace HrPayroll.Auth.Services;

public class ProfileService : IProfileService
{
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<EmployeeFinancials> _financials;
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

    public async Task<string> RequestIbanChangeAsync(string userId, string newIban)
    {
        if (string.IsNullOrWhiteSpace(newIban))
            throw new BadRequestException("New IBAN is required.");

        var transactionId = Guid.NewGuid().ToString();

        var payload = new
        {
            TransactionId = transactionId,
            Purpose = "iban_update"
        };

        var accessToken = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/otp/request")
        {
            Content = JsonContent.Create(payload)
        };

        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", accessToken);

        var response = await _otpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
            throw new BadRequestException("Failed to generate OTP");

        return transactionId;
    }

    public async Task UpdateIbanAsync(string userId, string newIban, string transactionId, string otpCode)
    {
        if (string.IsNullOrWhiteSpace(newIban) ||
            string.IsNullOrWhiteSpace(transactionId) ||
            string.IsNullOrWhiteSpace(otpCode))
        {
            throw new BadRequestException("All fields are required.");
        }

        var accessToken = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

        var verifyPayload = new
        {
            TransactionId = transactionId,
            Code = otpCode
        };

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/otp/verify")
        {
            Content = JsonContent.Create(verifyPayload)
        };

        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", accessToken);

        var response = await _otpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("Invalid or expired OTP. Update rejected.");

        var update = Builders<User>.Update.Set(u => u.Iban, newIban);
        var result = await _users.UpdateOneAsync(u => u.Id == userId, update);

        if (result.MatchedCount == 0)
            throw new NotFoundException("User not found for IBAN update.");
    }
}
