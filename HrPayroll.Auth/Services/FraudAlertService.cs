using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace HrPayroll.Auth.Services;

public class FraudAlertService
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

    public async Task HandleClientAsync(WebSocket socket)
    {
        string connectionId = Guid.NewGuid().ToString();
        _sockets.TryAdd(connectionId, socket);

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

        foreach (var socket in _sockets.Values)
        {
            if (socket.State == WebSocketState.Open)
            {
                try
                {
                    await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch
                {
                }
            }
        }
    }
}