using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using MailKit.Net.Smtp;
using MimeKit;

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

            await _channel.ExchangeDeclareAsync(exchange: "otp_exchange", type: ExchangeType.Direct);

            var queueName = "notification_email_queue";
            await _channel.QueueDeclareAsync(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            await _channel.QueueBindAsync(queue: queueName, exchange: "otp_exchange", routingKey: "otp.generated");

            _logger.LogInformation("Connected to RabbitMQ. Waiting for messages...");
            
            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var messageJson = Encoding.UTF8.GetString(body);
                
                try 
                {
                    using var doc = JsonDocument.Parse(messageJson);
                    var root = doc.RootElement;
                    var emailTo = root.GetProperty("Email").GetString();
                    var code = root.GetProperty("Code").GetString();

                    await SendEmailAsync(emailTo, code);
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

    private async Task SendEmailAsync(string? emailTo, string? code)
    {
        if (string.IsNullOrEmpty(emailTo) || string.IsNullOrEmpty(code)) return;

        try 
        {
            var host = _configuration["Smtp:Host"];
            var port = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var senderEmail = _configuration["Smtp:User"];
            var senderPassword = _configuration["Smtp:Pass"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("HR Payroll Security", senderEmail));
            message.To.Add(new MailboxAddress("Employee", emailTo));
            message.Subject = "Your Secure OTP Code";

            var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates", "OtpTemplate.html");
            string emailBody;


            var templateContent = await File.ReadAllTextAsync(templatePath);
            emailBody = templateContent.Replace("{{OTP_CODE}}", code);

            var builder = new BodyBuilder
            {
                HtmlBody = emailBody
            };
            
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            
            await client.ConnectAsync(host, port, false);
            await client.AuthenticateAsync(senderEmail, senderPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation($"Email sent to {emailTo} via Gmail!");
        }
        catch (Exception ex)
        {
            _logger.LogError($"SMTP Error: {ex.Message}");
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
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