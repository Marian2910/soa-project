using System.Text.Json.Serialization;

namespace HrPayroll.Auth.Models
{
    public class FraudAlertDto
    {
        [JsonPropertyName("EventType")]
        public string EventType { get; set; } = string.Empty;

        [JsonPropertyName("UserId")]
        public string UserId { get; set; } = string.Empty;

        [JsonPropertyName("Details")]
        public string Details { get; set; } = string.Empty;

        [JsonPropertyName("Timestamp")]
        public DateTime Timestamp { get; set; }
    }
}
