using System.ComponentModel.DataAnnotations;

namespace EngineerFlow.API.Models;

public class JobRequest
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string RequesterName { get; set; } = string.Empty;

    public int? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    public Priority Priority { get; set; } = Priority.Medium;

    public RequestStatus Status { get; set; } = RequestStatus.Open;

    [MaxLength(50)]
    public string? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    public CompletionEvent? CompletionEvent { get; set; }

    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();

    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();

    public bool IsDeleted { get; set; } = false;
}

public enum Priority { Low = 0, Medium = 1, High = 2, Critical = 3 }

public enum RequestStatus
{
    Open = 0,
    InProgress = 1,
    OnHold = 2,
    Completed = 3,
    Cancelled = 4
}