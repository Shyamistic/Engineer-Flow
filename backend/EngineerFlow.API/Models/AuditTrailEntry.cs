using System.ComponentModel.DataAnnotations;

namespace EngineerFlow.API.Models;

/// <summary>
/// Immutable global audit trail record. No cascade-delete — persists even after the 
/// related entity is deleted, ensuring a true compliance audit log.
/// </summary>
public class AuditTrailEntry
{
    public int Id { get; set; }

    /// <summary>The type of entity that was acted upon, e.g. "JobRequest", "User".</summary>
    [Required, MaxLength(100)]
    public string EntityType { get; set; } = string.Empty;

    /// <summary>The string ID of the entity (can survive FK deletion).</summary>
    [MaxLength(50)]
    public string? EntityId { get; set; }

    /// <summary>A short action label, e.g. Created / Updated / Deleted / StatusChanged / Completed / FileUploaded.</summary>
    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    /// <summary>Human-readable detail of what changed.</summary>
    public string Details { get; set; } = string.Empty;

    /// <summary>The actor who triggered the action — comes from JWT claim or defaults to "System".</summary>
    [MaxLength(100)]
    public string User { get; set; } = "System";

    /// <summary>IP address of the request at time of action.</summary>
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    /// <summary>Optional snapshot of the title/name of the entity at the time of the event.</summary>
    [MaxLength(200)]
    public string? EntityTitle { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>Wordwatch Intelligence Indicator</summary>
    public bool IsFlagged { get; set; }

    /// <summary>Reason for the Wordwatch flag, if any</summary>
    [MaxLength(255)]
    public string? FlagReason { get; set; }
}
