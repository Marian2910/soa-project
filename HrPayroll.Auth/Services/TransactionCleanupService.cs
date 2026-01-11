using Confluent.Kafka;
using HrPayroll.Auth.Models;
using MongoDB.Driver;
using System.Text.Json;

namespace HrPayroll.Auth.Services;

public class TransactionCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _config;
    private readonly string _kafkaBootstrapServers;

    public TransactionCleanupService(IServiceProvider serviceProvider, IConfiguration config)
    {
        _serviceProvider = serviceProvider;
        _config = config;
        _kafkaBootstrapServers = config["Kafka:BootstrapServers"];
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Yield();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredTransactions();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CleanupService] Error: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task CleanupExpiredTransactions()
    {
        using var scope = _serviceProvider.CreateScope();

        var mongoUrl = _config["MongoDb:ConnectionString"];
        var client = new MongoClient(mongoUrl);
        var db = client.GetDatabase("HrPayrollDb");
        var pendingUpdates = db.GetCollection<PendingUpdate>("PendingUpdates");

        var expirationThreshold = DateTime.UtcNow.AddMinutes(-5);

        var expiredTransactions = await pendingUpdates
            .Find(p => p.CreatedAt < expirationThreshold)
            .ToListAsync();

        if (expiredTransactions.Any())
        {
            Console.WriteLine($"[CleanupService] Found {expiredTransactions.Count} stale transactions.");
        }

        foreach (var txn in expiredTransactions)
        {
            await PublishFailureEvent(txn);
            await pendingUpdates.DeleteOneAsync(p => p.Id == txn.Id);
        }
    }

    private async Task PublishFailureEvent(PendingUpdate txn)
    {
        var config = new ProducerConfig { BootstrapServers = _kafkaBootstrapServers };
        using var producer = new ProducerBuilder<Null, string>(config).Build();

        var eventData = new
        {
            EventType = "IBAN_UPDATE_FAILED",
            UserId = txn.UserId,
            Details = "Transaction expired or abandoned by user.",
            Timestamp = txn.CreatedAt
        };

        try
        {
            await producer.ProduceAsync("audit-logs", new Message<Null, string>
            {
                Value = JsonSerializer.Serialize(eventData)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CleanupService] Kafka Error: {ex.Message}");
        }
    }
}