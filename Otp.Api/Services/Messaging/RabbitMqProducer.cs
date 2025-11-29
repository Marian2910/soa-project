using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace Otp.Api.Services.Messaging;

public class RabbitMqProducer : IMessageProducer, IDisposable
{
    private readonly ConnectionFactory _factory;
    private IConnection? _connection;
    private IChannel? _channel;

    public RabbitMqProducer(IConfiguration configuration)
    {
        _factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:HostName"] ?? "localhost",
            UserName = configuration["RabbitMQ:UserName"] ?? "guest",
            Password = configuration["RabbitMQ:Password"] ?? "guest"
        };
    }

    private async Task EnsureConnectionAsync()
    {
        if (_channel is { IsOpen: true }) return;

        try 
        {
            _connection = await _factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();
            
            await _channel.ExchangeDeclareAsync(exchange: "otp_exchange", type: ExchangeType.Direct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RabbitMQ] Critical Error connecting: {ex.Message}");
            throw;
        }
    }

    public async Task SendMessageAsync<T>(T message, string routingKey)
    {
        await EnsureConnectionAsync();

        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);

        var props = new BasicProperties();

        await _channel!.BasicPublishAsync(
            exchange: "otp_exchange",
            routingKey: routingKey,
            mandatory: false,
            basicProperties: props,
            body: body
        );

        Console.WriteLine($"[RabbitMQ] Sent message to '{routingKey}'");
    }

    public void Dispose()
    {
        try { _channel?.CloseAsync(); } catch { }
        try { _connection?.CloseAsync(); } catch { }
    }
}