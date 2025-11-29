namespace Otp.Api.Services.Messaging;

public interface IMessageProducer
{
    Task SendMessageAsync<T>(T message, string routingKey);
}