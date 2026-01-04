using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HrPayroll.Auth.Models;

public class PendingUpdate
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string TransactionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string NewIban { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}