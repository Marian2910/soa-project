using HrPayroll.Notifications;
using HrPayroll.Notifications.Models;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();