using Confluent.Kafka;
using HrPayroll.Auth.Models;
using MongoDB.Driver;
using System.Text.Json;

namespace HrPayroll.Auth.Services;

public class KafkaAuditConsumer : BackgroundService
{
    private readonly string _bootstrapServers;
    private readonly string _topic = "audit-logs";
    private readonly string _groupId = "audit-archiver-group";
    private readonly IMongoCollection<AuditRecord> _auditCollection;

    public KafkaAuditConsumer(IConfiguration config)
    {
        _bootstrapServers = config["Kafka:BootstrapServers"];

        var mongoUrl = config["MongoDb:ConnectionString"];
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");
        _auditCollection = db.GetCollection<AuditRecord>("AuditHistory");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Yield();

        var config = new ConsumerConfig
        {
            BootstrapServers = _bootstrapServers,
            GroupId = _groupId,
            AutoOffsetReset = AutoOffsetReset.Earliest
        };

        using var consumer = new ConsumerBuilder<Null, string>(config).Build();
        consumer.Subscribe(_topic);

        Console.WriteLine($"[AuditConsumer] Listening to {_topic}...");

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var cr = consumer.Consume(TimeSpan.FromMilliseconds(100));

                    if (cr != null && !string.IsNullOrEmpty(cr.Message.Value))
                    {
                        await ProcessMessageAsync(cr.Message.Value);
                    }
                }
                catch (ConsumeException e)
                {
                    Console.WriteLine($"[AuditConsumer] Error: {e.Error.Reason}");
                }
                catch (Exception)
                {
                }
            }
        }
        catch (OperationCanceledException)
        {
            consumer.Close();
        }
    }

    private async Task ProcessMessageAsync(string messageJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(messageJson);
            var root = doc.RootElement;

            string eventType = root.TryGetProperty("EventType", out var et) ? et.GetString() : "UNKNOWN";
            string userId = root.TryGetProperty("UserId", out var uid) ? uid.GetString() : "";

            DateTime timestamp = DateTime.UtcNow;
            if (root.TryGetProperty("Timestamp", out var ts) && ts.TryGetDateTime(out var parsedTime))
            {
                timestamp = parsedTime;
            }

            string details = "";

            if (eventType == "IBAN_UPDATED")
            {
                var iban = root.TryGetProperty("NewIban", out var nib) ? nib.GetString() : "Unknown";
                details = $"Changed IBAN to {iban}";
            }
            else if (eventType == "IBAN_UPDATE_FAILED")
            {
                details = root.TryGetProperty("Details", out var d) ? d.GetString() : "Update failed/expired";
            }
            else if (eventType == "USER_LOGIN")
            {
                details = "User logged into the system.";
            }
            else if (eventType == "PAYROLL_EXPORT")
            {
                details = "Exported full payroll history (Excel).";
            }
            else if (eventType == "PAYSLIP_DOWNLOAD")
            {
                var refId = root.TryGetProperty("Reference", out var r) ? r.GetString() : "N/A";
                details = $"Downloaded payslip: {refId}";
            }

            var record = new AuditRecord
            {
                UserId = userId,
                Action = eventType,
                Details = details,
                Timestamp = timestamp
            };

            await _auditCollection.InsertOneAsync(record);
            Console.WriteLine($"[AuditConsumer] Saved log for {userId}: {eventType} at {timestamp}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AuditConsumer] Parse Error: {ex.Message}");
        }
    }
}