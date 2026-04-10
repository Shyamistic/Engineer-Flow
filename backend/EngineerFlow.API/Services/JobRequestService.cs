using EngineerFlow.API.Data;
using EngineerFlow.API.DTOs;
using EngineerFlow.API.Models;
using EngineerFlow.API.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace EngineerFlow.API.Services;

public class JobRequestService : IJobRequestService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<JobHub, IJobClient> _hub;
    private readonly IAuditService _audit;

    public JobRequestService(AppDbContext db, IHubContext<JobHub, IJobClient> hub, IAuditService audit)
    {
        _db = db;
        _hub = hub;
        _audit = audit;
    }

    private static JobRequestResponseDto ToDto(JobRequest r) => new(
        r.Id, r.Title, r.Description, r.RequesterName, r.AssignedTo, r.AssignedUserId,
        r.Priority, r.Priority.ToString(), r.Status, r.Status.ToString(),
        r.Category, r.CreatedAt, r.UpdatedAt, r.DueDate,
        r.DueDate.HasValue && r.DueDate < DateTime.UtcNow && r.Status != RequestStatus.Completed && r.Status != RequestStatus.Cancelled,
        r.CompletionEvent == null ? null : new CompletionEventDto(
            r.CompletionEvent.Id, r.CompletionEvent.CompletedBy,
            r.CompletionEvent.CompletedAt, r.CompletionEvent.Notes,
            r.CompletionEvent.DurationMinutes, r.CompletionEvent.ResolutionSummary
        ),
        r.Attachments?.Select(a => new AttachmentDto(a.Id, a.FileName, a.FilePath, a.ContentType, a.FileSize, a.UploadedAt)),
        r.ActivityLogs?.OrderByDescending(l => l.Timestamp).Select(l => new ActivityLogDto(l.Id, l.Action, l.Details, l.User, l.Timestamp))
    );

    public async Task<IEnumerable<JobRequestResponseDto>> GetAllAsync(string? status, string? priority, string? search, string? sortBy, bool descending)
    {
        var query = _db.JobRequests
            .Include(r => r.CompletionEvent)
            .Include(r => r.Attachments)
            .Include(r => r.ActivityLogs)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<RequestStatus>(status, true, out var s))
            query = query.Where(r => r.Status == s);

        if (!string.IsNullOrWhiteSpace(priority) && Enum.TryParse<Priority>(priority, true, out var p))
            query = query.Where(r => r.Priority == p);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Title.Contains(search) || r.Description.Contains(search) || r.RequesterName.Contains(search));

        query = (sortBy?.ToLower(), descending) switch
        {
            ("priority", false) => query.OrderBy(r => r.Priority),
            ("priority", true) => query.OrderByDescending(r => r.Priority),
            ("createdat", false) => query.OrderBy(r => r.CreatedAt),
            ("createdat", true) => query.OrderByDescending(r => r.CreatedAt),
            ("duedate", false) => query.OrderBy(r => r.DueDate),
            ("duedate", true) => query.OrderByDescending(r => r.DueDate),
            _ => query.OrderByDescending(r => r.UpdatedAt)
        };

        return (await query.ToListAsync()).Select(ToDto);
    }

    public async Task<JobRequestResponseDto?> GetByIdAsync(int id)
    {
        var r = await _db.JobRequests
            .Include(x => x.CompletionEvent)
            .Include(x => x.Attachments)
            .Include(x => x.ActivityLogs)
            .FirstOrDefaultAsync(x => x.Id == id);
        return r == null ? null : ToDto(r);
    }

    public async Task<JobRequestResponseDto> CreateAsync(CreateJobRequestDto dto)
    {
        var req = new JobRequest
        {
            Title = dto.Title, Description = dto.Description,
            RequesterName = dto.RequesterName, AssignedTo = dto.AssignedTo,
            Priority = dto.Priority, Category = dto.Category, DueDate = dto.DueDate
        };
        
        req.ActivityLogs.Add(new ActivityLog { Action = "Created", Details = $"Job created by {dto.RequesterName}" });

        _db.JobRequests.Add(req);
        await _db.SaveChangesAsync();

        // Global audit trail
        await _audit.LogAsync("JobRequest", req.Id.ToString(), "Created",
            $"Job Request '{req.Title}' created by {dto.RequesterName}",
            dto.RequesterName, entityTitle: req.Title);

        await _hub.Clients.Group("JobUpdates").JobCreated(req);
        return ToDto(req);
    }

    public async Task<JobRequestResponseDto?> UpdateAsync(int id, UpdateJobRequestDto dto)
    {
        var req = await _db.JobRequests
            .Include(x => x.CompletionEvent)
            .Include(x => x.Attachments)
            .Include(x => x.ActivityLogs)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (req == null) return null;

        var details = new List<string>();
        if (dto.Title != null && req.Title != dto.Title) { details.Add($"Title: {req.Title} -> {dto.Title}"); req.Title = dto.Title; }
        if (dto.Description != null && req.Description != dto.Description) { details.Add("Description changed"); req.Description = dto.Description; }
        if (dto.AssignedTo != null && req.AssignedTo != dto.AssignedTo) { details.Add($"Assigned to: {req.AssignedTo} -> {dto.AssignedTo}"); req.AssignedTo = dto.AssignedTo; }
        if (dto.Priority.HasValue && req.Priority != dto.Priority) { details.Add($"Priority: {req.Priority} -> {dto.Priority}"); req.Priority = dto.Priority.Value; }
        if (dto.Status.HasValue && req.Status != dto.Status) { details.Add($"Status: {req.Status} -> {dto.Status}"); req.Status = dto.Status.Value; }
        if (dto.Category != null && req.Category != dto.Category) { details.Add($"Category: {req.Category} -> {dto.Category}"); req.Category = dto.Category; }
        if (dto.DueDate.HasValue && req.DueDate != dto.DueDate) { details.Add($"Due date: {req.DueDate} -> {dto.DueDate}"); req.DueDate = dto.DueDate; }

        if (details.Any())
        {
            req.UpdatedAt = DateTime.UtcNow;
            req.ActivityLogs.Add(new ActivityLog { Action = "Updated", Details = string.Join(", ", details) });
            await _db.SaveChangesAsync();

            // Global audit trail
            await _audit.LogAsync("JobRequest", req.Id.ToString(), "Updated",
                string.Join(", ", details), entityTitle: req.Title);

            await _hub.Clients.Group("JobUpdates").JobUpdated(req);
        }

        return ToDto(req);
    }

    public async Task<JobRequestResponseDto?> UpdateStatusAsync(int id, RequestStatus newStatus)
        => await UpdateAsync(id, new UpdateJobRequestDto(null, null, null, null, newStatus, null, null));

    public async Task<JobRequestResponseDto?> RecordCompletionAsync(int id, RecordCompletionDto dto)
    {
        var req = await _db.JobRequests
            .Include(x => x.CompletionEvent)
            .Include(x => x.ActivityLogs)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (req == null) return null;

        req.Status = RequestStatus.Completed;
        req.UpdatedAt = DateTime.UtcNow;
        req.ActivityLogs.Add(new ActivityLog { Action = "Completed", Details = $"Completed by {dto.CompletedBy}. Notes: {dto.Notes}" });

        if (req.CompletionEvent != null)
        {
            req.CompletionEvent.CompletedBy = dto.CompletedBy;
            req.CompletionEvent.CompletedAt = DateTime.UtcNow;
            req.CompletionEvent.Notes = dto.Notes;
            req.CompletionEvent.DurationMinutes = dto.DurationMinutes;
            req.CompletionEvent.ResolutionSummary = dto.ResolutionSummary;
        }
        else
        {
            req.CompletionEvent = new CompletionEvent
            {
                JobRequestId = id, CompletedBy = dto.CompletedBy,
                Notes = dto.Notes, DurationMinutes = dto.DurationMinutes,
                ResolutionSummary = dto.ResolutionSummary
            };
        }

        await _db.SaveChangesAsync();

        // Global audit trail
        await _audit.LogAsync("JobRequest", req.Id.ToString(), "Completed",
            $"Completed by {dto.CompletedBy}. Notes: {dto.Notes}",
            dto.CompletedBy, entityTitle: req.Title);

        await _hub.Clients.Group("JobUpdates").JobUpdated(req);
        return ToDto(req);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var req = await _db.JobRequests.FindAsync(id);
        if (req == null) return false;

        // Log BEFORE removing — ensures audit persists after cascade delete
        await _audit.LogAsync("JobRequest", req.Id.ToString(), "Deleted",
            $"Job Request '{req.Title}' deleted permanently", entityTitle: req.Title);

        // Soft Delete
        req.IsDeleted = true;
        await _db.SaveChangesAsync();
        await _hub.Clients.Group("JobUpdates").JobDeleted(id);
        return true;
    }

    public async Task<bool> RestoreAsync(int id)
    {
        var req = await _db.JobRequests.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (req == null || !req.IsDeleted) return false;

        req.IsDeleted = false;
        
        await _audit.LogAsync("JobRequest", req.Id.ToString(), "Restored",
            $"Job Request '{req.Title}' restored from trash", entityTitle: req.Title);

        await _db.SaveChangesAsync();
        await _hub.Clients.Group("JobUpdates").JobCreated(req); // Re-broadcast as created
        return true;
    }

    public async Task<JobRequestSummaryDto> GetSummaryAsync()
    {
        var all = await _db.JobRequests.ToListAsync();
        return new JobRequestSummaryDto(
            all.Count,
            all.Count(r => r.Status == RequestStatus.Open),
            all.Count(r => r.Status == RequestStatus.InProgress),
            all.Count(r => r.Status == RequestStatus.OnHold),
            all.Count(r => r.Status == RequestStatus.Completed),
            all.Count(r => r.Status == RequestStatus.Cancelled),
            all.Count(r => r.DueDate.HasValue && r.DueDate < DateTime.UtcNow && r.Status != RequestStatus.Completed && r.Status != RequestStatus.Cancelled),
            all.Count(r => r.Priority == Priority.Critical && r.Status != RequestStatus.Completed && r.Status != RequestStatus.Cancelled)
        );
    }
}