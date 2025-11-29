using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace HrPayroll.Notifications;

public class Worker : BackgroundService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<Worker> _logger;
    private IConnection? _connection;
    private IChannel? _channel;

    public Worker(IConfiguration configuration, ILogger<Worker> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = _configuration["RabbitMQ:HostName"] ?? "localhost",
            UserName = _configuration["RabbitMQ:UserName"] ?? "guest",
            Password = _configuration["RabbitMQ:Password"] ?? "guest"
        };

        try 
        {
            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();

            // 2. Declare Exchange (Must match Producer!)
            await _channel.ExchangeDeclareAsync(exchange: "otp_exchange", type: ExchangeType.Direct);

            // 3. Declare Queue
            var queueName = "notification_email_queue";
            await _channel.QueueDeclareAsync(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            // 4. Bind Queue to Exchange (Routing Key: "otp.generated")
            await _channel.QueueBindAsync(queue: queueName, exchange: "otp_exchange", routingKey: "otp.generated");

            _logger.LogInformation("Connected to RabbitMQ. Waiting for messages...");
            
            // 5. Setup Consumer
            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                
                try 
                {
                    // Parse the JSON (We just print it for now)
                    using var doc = JsonDocument.Parse(message);
                    var root = doc.RootElement;
                    var email = root.GetProperty("Email").GetString();
                    var code = root.GetProperty("Code").GetString();

                    _logger.LogInformation($"📧 [EMAIL SENT] To: {email} | Code: {code}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error processing message: {ex.Message}");
                }
            };

            await _channel.BasicConsumeAsync(queue: queueName, autoAck: true, consumer: consumer);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Could not connect to RabbitMQ: {ex.Message}");
        }

        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Keep the service alive
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);
        }
    }
    
    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _channel?.Dispose();
        _connection?.Dispose();
        await base.StopAsync(cancellationToken);
    }
}