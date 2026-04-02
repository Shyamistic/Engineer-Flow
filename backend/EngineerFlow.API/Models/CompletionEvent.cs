using System.ComponentModel.DataAnnotations;

namespace EngineerFlow.API.Models;

public class CompletionEvent
{
    public int Id { get; set; }

    public int JobRequestId { get; set; }
    public JobRequest JobRequest { get; set; } = null!;

    [Required, MaxLength(100)]
    public string CompletedBy { get; set; } = string.Empty;

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }

    public int? DurationMinutes { get; set; }

    [MaxLength(200)]
    public string? ResolutionSummary { get; set; }
}