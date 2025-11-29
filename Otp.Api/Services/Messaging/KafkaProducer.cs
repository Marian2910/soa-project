using Confluent.Kafka;
using System.Text.Json;

namespace Otp.Api.Services.Messaging;

public class KafkaProducer : IDisposable
{
    private readonly IProducer<Null, string> _producer;
    private readonly string _topicName = "otp.validated";

    public KafkaProducer(IConfiguration config)
    {
        var producerConfig = new ProducerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:9092"
        };

        _producer = new ProducerBuilder<Null, string>(producerConfig).Build();
    }

    public async Task ProduceAsync(string userId, string transactionId, string status)
    {
        var eventData = new
        {
            Event = "OtpValidated",
            UserId = userId,
            TransactionId = transactionId,
            Status = status,
            Timestamp = DateTime.UtcNow
        };

        var message = new Message<Null, string>
        {
            Value = JsonSerializer.Serialize(eventData)
        };

        try
        {
            var result = await _producer.ProduceAsync(_topicName, message);
            Console.WriteLine($"[Kafka] Audit Event pushed to '{_topicName}': {result.Status}");
        }
        catch (ProduceException<Null, string> e)
        {
            Console.WriteLine($"[Kafka] Error producing message: {e.Error.Reason}");
        }
    }

    public void Dispose()
    {
        _producer?.Flush(TimeSpan.FromSeconds(10));
        _producer?.Dispose();
    }
}