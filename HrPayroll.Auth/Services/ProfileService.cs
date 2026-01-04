using HrPayroll.Auth.Exceptions;
using HrPayroll.Auth.Models;
using HrPayroll.Profile.Models;
using MongoDB.Driver;

namespace HrPayroll.Auth.Services;

public class ProfileService : IProfileService
{
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<EmployeeFinancials> _financials;
    private readonly HttpClient _otpClient;

    public ProfileService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        var mongoUrl = config["MongoDb:ConnectionString"] ?? "mongodb://admin:password@localhost:27017";
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");

        _users = db.GetCollection<User>("Users");
        _financials = db.GetCollection<EmployeeFinancials>("Financials");

        _otpClient = httpClientFactory.CreateClient("OtpClient");
    }

    public async Task<UserProfileDto> GetProfileAsync(string userId)
    {
        var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) throw new NotFoundException("User not found");

        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Iban = user.Iban
        };
    }

    public async Task<EmployeeFinancials> GetFinancialsAsync(string userId)
    {
        var financials = await _financials.Find(f => f.UserId == userId).FirstOrDefaultAsync();
        if (financials == null)
            throw new NotFoundException("Financial records not found for this user.");

        return financials;
    }

    public async Task<string> RequestIbanChangeAsync(string userId, string newIban)
    {
        if (string.IsNullOrWhiteSpace(newIban))
            throw new BadRequestException("IBAN is required.");

        // generate transactionId
        var transactionId = Guid.NewGuid().ToString();

        // call OTP microservice
        var response = await _otpClient.PostAsJsonAsync("/api/otp/request", new
        {
            TransactionId = transactionId,
            Purpose = "iban_update"
        });

        if (!response.IsSuccessStatusCode)
            throw new BadRequestException("Failed to generate OTP");

        return transactionId;
    }

    public async Task UpdateIbanAsync(string userId, string newIban, string transactionId, string otpCode)
    {
        if (string.IsNullOrWhiteSpace(otpCode))
            throw new BadRequestException("OTP code is required.");

        var verifyPayload = new { TransactionId = transactionId, Code = otpCode };
        var response = await _otpClient.PostAsJsonAsync("/api/otp/verify", verifyPayload);

        if (!response.IsSuccessStatusCode)
            throw new BadRequestException("Invalid or expired OTP. Update rejected.");

        var update = Builders<User>.Update.Set(u => u.Iban, newIban);
        var result = await _users.UpdateOneAsync(u => u.Id == userId, update);

        if (result.MatchedCount == 0)
            throw new NotFoundException("User not found for IBAN update.");
    }
}
