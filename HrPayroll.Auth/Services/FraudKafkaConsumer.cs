using Confluent.Kafka;
using System.Text.Json;
using HrPayroll.Auth.Models;

namespace HrPayroll.Auth.Services;

public class FraudKafkaConsumer : BackgroundService
{
    private readonly FraudAlertService _fraudService;
    private readonly string _bootstrapServers;
    private readonly string _topic = "audit-logs";

    public FraudKafkaConsumer(FraudAlertService fraudService, IConfiguration config)
    {
        _fraudService = fraudService;
        _bootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:9092";
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Yield();

        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _bootstrapServers,
            GroupId = "fraud-websocket-broadcaster",
            AutoOffsetReset = AutoOffsetReset.Latest
        };

        using var consumer = new ConsumerBuilder<Null, string>(consumerConfig).Build();
        consumer.Subscribe(_topic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var cr = consumer.Consume(TimeSpan.FromMilliseconds(100));

                    if (cr?.Message?.Value != null)
                    {
                        var alert = JsonSerializer.Deserialize<FraudAlertDto>(cr.Message.Value);

                        if (alert != null && alert.EventType == "FRAUD_DETECTED")
                        {
                            await _fraudService.BroadcastAsync(alert);
                        }
                    }
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
}