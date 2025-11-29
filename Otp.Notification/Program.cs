using Otp.Notification;

var builder = Host.CreateApplicationBuilder(args);

// 1. Register the Worker Service
// This tells .NET: "Start this class when the app starts, and keep it running."
builder.Services.AddHostedService<Worker>();

// 2. Build and Run
var host = builder.Build();
host.Run();