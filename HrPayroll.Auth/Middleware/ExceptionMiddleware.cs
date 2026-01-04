using System.Net;
using HrPayroll.Auth.Exceptions;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace HrPayroll.Auth.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
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
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = ex switch
            {
                NotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedException => (int)HttpStatusCode.Unauthorized,
                BadRequestException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            var result = JsonSerializer.Serialize(new
            {
                error = ex.Message,
                type = ex.GetType().Name
            });

            return context.Response.WriteAsync(result);
        }
    }
}