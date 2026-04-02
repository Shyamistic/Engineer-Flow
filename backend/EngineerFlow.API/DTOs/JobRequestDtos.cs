using EngineerFlow.API.Models;
using System.ComponentModel.DataAnnotations;

namespace EngineerFlow.API.DTOs;

public record CreateJobRequestDto(
    [Required, MaxLength(200)] string Title,
    [Required] string Description,
    [Required, MaxLength(100)] string RequesterName,
    string? AssignedTo,
    Priority Priority,
    string? Category,
    DateTime? DueDate
);

public record UpdateJobRequestDto(
    string? Title,
    string? Description,
    string? AssignedTo,
    Priority? Priority,
    RequestStatus? Status,
    string? Category,
    DateTime? DueDate
);

public record JobRequestResponseDto(
    int Id,
    string Title,
    string Description,
    string RequesterName,
    string? AssignedTo,
    int? AssignedUserId,
    Priority Priority,
    string PriorityLabel,
    RequestStatus Status,
    string StatusLabel,
    string? Category,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? DueDate,
    bool IsOverdue,
    CompletionEventDto? CompletionEvent,
    IEnumerable<AttachmentDto>? Attachments = null,
    IEnumerable<ActivityLogDto>? ActivityLogs = null
);

public record AttachmentDto(
    int Id,
    string FileName,
    string FilePath,
    string ContentType,
    long FileSize,
    DateTime UploadedAt
);

public record ActivityLogDto(
    int Id,
    string Action,
    string Details,
    string User,
    DateTime Timestamp
);

public record CompletionEventDto(
    int Id,
    string CompletedBy,
    DateTime CompletedAt,
    string? Notes,
    int? DurationMinutes,
    string? ResolutionSummary
);

public record RecordCompletionDto(
    [Required, MaxLength(100)] string CompletedBy,
    string? Notes,
    int? DurationMinutes,
    string? ResolutionSummary
);

public record JobRequestSummaryDto(
    int Total,
    int Open,
    int InProgress,
    int OnHold,
    int Completed,
    int Cancelled,
    int Overdue,
    int Critical
);

public record LoginDto([Required] string Username, [Required] string Password);
public record RegisterDto([Required] string Username, [Required] string Password, string? FullName, UserRole Role = UserRole.User);
public record AuthResponseDto(string Token, int UserId, string Username, string Role);