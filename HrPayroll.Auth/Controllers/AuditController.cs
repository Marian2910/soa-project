using Confluent.Kafka;
using HrPayroll.Auth.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using System.Text.Json;

namespace HrPayroll.Auth.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly IMongoCollection<AuditRecord> _auditCollection;
    private readonly IConfiguration _config;

    public AuditController(IConfiguration config)
    {
        _config = config;
        var mongoUrl = config["MongoDb:ConnectionString"];
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");
        _auditCollection = db.GetCollection<AuditRecord>("AuditHistory");
    }

    [HttpGet]
    public async Task<IActionResult> GetMyAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? eventType = null,
            [FromQuery] string? details = null,
            [FromQuery] string? startDate = null,
            [FromQuery] string? endDate = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var builder = Builders<AuditRecord>.Filter;
        var filter = builder.Eq(x => x.UserId, userId);

        if (!string.IsNullOrEmpty(eventType) && eventType != "ALL") 
        {
            filter &= builder.Eq(x => x.Action, eventType);
        }

        if (!string.IsNullOrWhiteSpace(details))
        {
            filter &= builder.Regex(
                x => x.Details,
                new BsonRegularExpression(details, "i")
            );
        }

        if (!string.IsNullOrEmpty(startDate))
        {
            var start = DateTime.Parse(startDate).Date;
            filter &= builder.Gte(x => x.Timestamp, start);
        }

        if (!string.IsNullOrEmpty(endDate))
        {
            var end = DateTime.Parse(endDate).Date.AddDays(1).AddTicks(-1);
            filter &= builder.Lte(x => x.Timestamp, end);
        }



        var totalCount = await _auditCollection.CountDocumentsAsync(filter);

        var logs = await _auditCollection
            .Find(filter)
            .SortByDescending(x => x.Timestamp)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return Ok(new
        {
            Data = logs,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpPost("log")]
    public async Task<IActionResult> LogClientEvent([FromBody] ClientAuditRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var config = new ProducerConfig { BootstrapServers = _config["Kafka:BootstrapServers"] };
        using var producer = new ProducerBuilder<Null, string>(config).Build();

        var eventData = new
        {
            EventType = request.Action,
            UserId = userId,
            Reference = request.Reference,
            Timestamp = DateTime.UtcNow
        };

        await producer.ProduceAsync("audit-logs", new Message<Null, string> { Value = JsonSerializer.Serialize(eventData) });

        return Ok();
    }

    [HttpGet("recent-fraud")]
    public async Task<IActionResult> GetRecentFraudAlerts()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // Only check for fraud in the last 30 seconds (time to complete OTP verification)
        var thirtySecondsAgo = DateTime.UtcNow.AddSeconds(-30);

        var builder = Builders<AuditRecord>.Filter;
        var filter = builder.Eq(x => x.UserId, userId)
                   & builder.Eq(x => x.Action, "FRAUD_DETECTED")
                   & builder.Gte(x => x.Timestamp, thirtySecondsAgo);

        var fraudAlerts = await _auditCollection
            .Find(filter)
            .SortByDescending(x => x.Timestamp)
            .Limit(1)
            .ToListAsync();

        return Ok(new { HasRecentFraud = fraudAlerts.Any(), Alert = fraudAlerts.FirstOrDefault() });
    }

    public class ClientAuditRequest
    {
        public string Action { get; set; } = string.Empty;
        public string? Reference { get; set; }
    }
}