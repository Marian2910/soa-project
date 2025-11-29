using System.Net;
using System.Text.Json;

namespace Otp.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        var statusCode = HttpStatusCode.InternalServerError;
        string message = "Oops! Something went wrong on our server.";

        if (ex is ArgumentException)
        {
            statusCode = HttpStatusCode.BadRequest;
            message = ex.Message;
        }
        else if (ex is KeyNotFoundException)
        {
            statusCode = HttpStatusCode.NotFound;
            message = ex.Message;
        }

        context.Response.StatusCode = (int)statusCode;
        var result = JsonSerializer.Serialize(new { errorMessage = message });
        await context.Response.WriteAsync(result);
    }
}