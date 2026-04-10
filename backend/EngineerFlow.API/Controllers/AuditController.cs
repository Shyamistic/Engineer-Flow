using EngineerFlow.API.DTOs;
using EngineerFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService) => _auditService = auditService;

    /// <summary>
    /// Get paginated audit trail entries with optional filters.
    /// Supports filtering by action type, entity type, date range, and free-text search.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AuditPagedResult>> GetAuditTrail(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] bool? isFlagged = null)
    {
        var query = new AuditQueryParams(page, pageSize, action, entityType, search, from, to, isFlagged);
        var result = await _auditService.GetPagedAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get distinct action types for populating filter dropdowns.
    /// </summary>
    [HttpGet("action-types")]
    public ActionResult<IEnumerable<string>> GetActionTypes()
    {
        return Ok(new[] { "Created", "Updated", "StatusChanged", "Completed", "Deleted", "FileUploaded" });
    }

    /// <summary>
    /// Get audit statistics for the dashboard widget.
    /// Returns counts of events in last 24h / 7d and most active users.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<AuditStats>> GetStats()
    {
        var result = await _auditService.GetPagedAsync(new AuditQueryParams(1, 1000));
        var all = result.Items.ToList();

        var now = DateTime.UtcNow;
        var stats = new AuditStats
        {
            TotalEvents = result.Total,
            Last24hEvents = all.Count(e => e.Timestamp >= now.AddHours(-24)),
            Last7dEvents = all.Count(e => e.Timestamp >= now.AddDays(-7)),
            TopUser = all.GroupBy(e => e.User)
                         .OrderByDescending(g => g.Count())
                         .Select(g => g.Key)
                         .FirstOrDefault() ?? "N/A",
            RecentActions = all.Take(5).ToList()
        };
        return Ok(stats);
    }
}

public class AuditStats
{
    public int TotalEvents { get; set; }
    public int Last24hEvents { get; set; }
    public int Last7dEvents { get; set; }
    public string TopUser { get; set; } = string.Empty;
    public List<AuditTrailEntryDto> RecentActions { get; set; } = new();
}
