using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HrPayroll.Profile.Models;

[BsonIgnoreExtraElements] // Ignores extra fields (like PasswordHash) we don't need here
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    
    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("fullName")]
    public string FullName { get; set; } = string.Empty;

    [BsonElement("iban")]
    public string Iban { get; set; } = string.Empty;
}