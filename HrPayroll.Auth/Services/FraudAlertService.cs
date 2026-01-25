using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace HrPayroll.Auth.Services;

public class FraudAlertService
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
    private readonly ILogger<FraudAlertService> _logger;

    public FraudAlertService(ILogger<FraudAlertService> logger)
    {
        _logger = logger;
    }

    public async Task HandleClientAsync(WebSocket socket)
    {
        string connectionId = Guid.NewGuid().ToString();
        _sockets.TryAdd(connectionId, socket);
        _logger.LogInformation($"[FraudAlert] WebSocket connected: {connectionId}. Total connections: {_sockets.Count}");

        var buffer = new byte[1024 * 4];

        try
        {
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                    _sockets.TryRemove(connectionId, out _);
                    _logger.LogInformation($"[FraudAlert] WebSocket disconnected: {connectionId}. Total connections: {_sockets.Count}");
                }
            }
        }
        catch
        {
            _sockets.TryRemove(connectionId, out _);
        }
    }

    public async Task BroadcastAsync(object alert)
    {
        var json = JsonSerializer.Serialize(alert);
        var bytes = Encoding.UTF8.GetBytes(json);
        var segment = new ArraySegment<byte>(bytes);

        _logger.LogWarning($"[FraudAlert] Broadcasting to {_sockets.Count} connected clients: {json}");

        foreach (var socket in _sockets.Values)
        {
            if (socket.State == WebSocketState.Open)
            {
                try
                {
                    await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
                    _logger.LogInformation($"[FraudAlert] Successfully sent alert to client");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"[FraudAlert] Failed to send to client: {ex.Message}");
                }
            }
        }
    }
}