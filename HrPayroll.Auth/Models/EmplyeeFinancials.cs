using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HrPayroll.Auth.Models;

public class EmployeeFinancials
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("employmentStatus")]
    public string EmploymentStatus { get; set; } = string.Empty;

    [BsonElement("jobTitle")]
    public string JobTitle { get; set; } = string.Empty;

    [BsonElement("baseSalary")]
    public decimal BaseSalary { get; set; }

    [BsonElement("currency")]
    public string Currency { get; set; } = string.Empty;

    [BsonElement("nextPayDate")]
    public DateTime NextPayDate { get; set; }

    [BsonElement("payoutHistory")]
    public List<PayoutRecord> PayoutHistory { get; set; } = new();
}