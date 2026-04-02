using System.ComponentModel.DataAnnotations;

namespace EngineerFlow.API.Models;

public class ActivityLog
{
    public int Id { get; set; }
    
    public int? JobRequestId { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    public string Details { get; set; } = string.Empty;

    public string User { get; set; } = "System";

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
