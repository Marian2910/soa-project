using MongoDB.Bson.Serialization.Attributes;

namespace HrPayroll.Auth.Models;

public class PayoutRecord
{
    [BsonElement("date")]
    public DateTime Date { get; set; }

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("reference")]
    public string Reference { get; set; } = string.Empty;
}