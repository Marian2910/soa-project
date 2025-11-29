using HrPayroll.OtpService.Middleware;
using Microsoft.Extensions.Hosting;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Logging;
using Moq;

namespace Otp.Tests
{
    public class ErrorHandlingMiddlewareTests
    {
        private readonly Mock<ILogger<ErrorHandlingMiddleware>> _mockLogger = new();

        [Fact]
        public async Task Invoke_ShouldReturnOk_WhenNoException()
        {
            var host = await new HostBuilder()
                .ConfigureWebHost(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.Configure(app =>
                    {
                        app.UseMiddleware<ErrorHandlingMiddleware>(_mockLogger.Object);
                        app.Run(async context =>
                        {
                            context.Response.StatusCode = 200;
                            await context.Response.WriteAsync("OK");
                        });
                    });
                }).StartAsync();

            var client = host.GetTestClient();

            var response = await client.GetAsync("/");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var body = await response.Content.ReadAsStringAsync();
            Assert.Equal("OK", body);

            _mockLogger.Verify(
                x => x.Log(
                    It.IsAny<LogLevel>(),
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()
                ),
                Times.Never
            );
        }

        [Fact]
        public async Task Invoke_ShouldReturnInternalServerError_WhenGenericExceptionThrown()
        {
            var exceptionMessage = "Oops! Something went wrong on our server.";
            var host = await new HostBuilder()
                .ConfigureWebHost(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.Configure(app =>
                    {
                        app.UseMiddleware<ErrorHandlingMiddleware>(_mockLogger.Object);
                        app.Run(_ => throw new Exception(exceptionMessage));
                    });
                }).StartAsync();

            var client = host.GetTestClient();

            var response = await client.GetAsync("/");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            var json = JsonSerializer.Deserialize<JsonElement>(body);
            Assert.Equal(exceptionMessage, json.GetProperty("errorMessage").GetString());

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()
                ),
                Times.Once
            );
        }

        [Fact]
        public async Task Invoke_ShouldReturnBadRequest_WhenArgumentExceptionThrown()
        {
            var exceptionMessage = "Invalid user ID provided.";
            var host = await new HostBuilder()
                .ConfigureWebHost(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.Configure(app =>
                    {
                        app.UseMiddleware<ErrorHandlingMiddleware>(_mockLogger.Object);
                        app.Run(_ => throw new ArgumentException(exceptionMessage));
                    });
                }).StartAsync();

            var client = host.GetTestClient();
            var response = await client.GetAsync("/");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            var json = JsonSerializer.Deserialize<JsonElement>(body);
            Assert.Equal(exceptionMessage, json.GetProperty("errorMessage").GetString());
        }

        [Fact]
        public async Task Invoke_ShouldReturnNotFound_WhenKeyNotFoundExceptionThrown()
        {
            var exceptionMessage = "Requested resource was not found.";
            var host = await new HostBuilder()
                .ConfigureWebHost(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.Configure(app =>
                    {
                        app.UseMiddleware<ErrorHandlingMiddleware>(_mockLogger.Object);
                        app.Run(_ => throw new KeyNotFoundException(exceptionMessage));
                    });
                }).StartAsync();

            var client = host.GetTestClient();
            var response = await client.GetAsync("/");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            var json = JsonSerializer.Deserialize<JsonElement>(body);
            Assert.Equal(exceptionMessage, json.GetProperty("errorMessage").GetString());
        }
    }
}
