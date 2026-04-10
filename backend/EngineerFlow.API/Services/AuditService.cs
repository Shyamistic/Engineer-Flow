using EngineerFlow.API.Data;
using EngineerFlow.API.DTOs;
using EngineerFlow.API.Hubs;
using EngineerFlow.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EngineerFlow.API.Services;

public interface IAuditService
{
    Task LogAsync(string entityType, string? entityId, string action, string details,
                  string user = "System", string? ipAddress = null, string? entityTitle = null);

    Task<AuditPagedResult> GetPagedAsync(AuditQueryParams query);
}

public record AuditQueryParams(
    int Page = 1,
    int PageSize = 50,
    string? Action = null,
    string? EntityType = null,
    string? Search = null,
    DateTime? From = null,
    DateTime? To = null,
    bool? IsFlagged = null
);

public record AuditPagedResult(
    IEnumerable<AuditTrailEntryDto> Items,
    int Total,
    int Page,
    int PageSize,
    int TotalPages
);

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<JobHub, IJobClient> _hub;
    private readonly IWordWatchService _wordWatch;
    private readonly IWebhookService _webhook;

    public AuditService(AppDbContext db, IHubContext<JobHub, IJobClient> hub, IWordWatchService wordWatch, IWebhookService webhook)
    {
        _db = db;
        _hub = hub;
        _wordWatch = wordWatch;
        _webhook = webhook;
    }

    public async Task LogAsync(string entityType, string? entityId, string action, string details,
                               string user = "System", string? ipAddress = null, string? entityTitle = null)
    {
        var analysis = _wordWatch.AnalyzeText($"{entityTitle} {details}");

        var entry = new AuditTrailEntry
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            Details = details,
            User = user,
            IpAddress = ipAddress,
            EntityTitle = entityTitle,
            Timestamp = DateTime.UtcNow,
            IsFlagged = analysis.IsFlagged,
            FlagReason = analysis.Reason
        };

        _db.AuditTrailEntries.Add(entry);
        await _db.SaveChangesAsync();

        // Broadcast real-time to all connected clients
        try
        {
            await _hub.Clients.Group("JobUpdates").AuditEntryCreated(entry);
        }
        catch
        {
            // SignalR broadcast failure must never break the audit write
        }

        if (entry.IsFlagged)
        {
            _ = _webhook.DispatchEventAsync("Wordwatch.Flagged", entry);
        }
    }

    public async Task<AuditPagedResult> GetPagedAsync(AuditQueryParams q)
    {
        var query = _db.AuditTrailEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.Action))
            query = query.Where(e => e.Action.ToLower() == q.Action.ToLower());

        if (!string.IsNullOrWhiteSpace(q.EntityType))
            query = query.Where(e => e.EntityType.ToLower() == q.EntityType.ToLower());

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(e => e.Details.Contains(q.Search) ||
                                      e.User.Contains(q.Search) ||
                                      (e.EntityTitle != null && e.EntityTitle.Contains(q.Search)));

        if (q.From.HasValue)
            query = query.Where(e => e.Timestamp >= q.From.Value);

        if (q.To.HasValue)
            query = query.Where(e => e.Timestamp <= q.To.Value);

        if (q.IsFlagged.HasValue)
            query = query.Where(e => e.IsFlagged == q.IsFlagged.Value);

        var total = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(total / (double)q.PageSize);

        var items = await query
            .OrderByDescending(e => e.Timestamp)
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(e => new AuditTrailEntryDto(
                e.Id, e.EntityType, e.EntityId, e.Action, e.Details,
                e.User, e.IpAddress, e.EntityTitle, e.Timestamp, e.IsFlagged, e.FlagReason))
            .ToListAsync();

        return new AuditPagedResult(items, total, q.Page, q.PageSize, totalPages);
    }
}
