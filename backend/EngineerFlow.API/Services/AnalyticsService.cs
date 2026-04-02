using EngineerFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EngineerFlow.API.Services;

public interface IAnalyticsService
{
    Task<DashboardStats> GetDashboardStats();
}

public class DashboardStats
{
    public int TotalRequests { get; set; }
    public int OpenRequests { get; set; }
    public int InProgressRequests { get; set; }
    public int CompletedRequests { get; set; }
    public Dictionary<string, int> RequestsByCategory { get; set; } = new();
    public List<MonthlyTrend> MonthlyTrends { get; set; } = new();
}

public class MonthlyTrend
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AnalyticsService : IAnalyticsService
{
    private readonly Data.AppDbContext _context;

    public AnalyticsService(Data.AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStats> GetDashboardStats()
    {
        var stats = new DashboardStats
        {
            TotalRequests = await _context.JobRequests.CountAsync(),
            OpenRequests = await _context.JobRequests.CountAsync(r => r.Status == RequestStatus.Open),
            InProgressRequests = await _context.JobRequests.CountAsync(r => r.Status == RequestStatus.InProgress),
            CompletedRequests = await _context.JobRequests.CountAsync(r => r.Status == RequestStatus.Completed),
            RequestsByCategory = await _context.JobRequests
                .Where(r => !string.IsNullOrEmpty(r.Category))
                .GroupBy(r => r.Category!)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Category, x => x.Count)
        };

        // Fetch data first, then format in-memory (SQLite doesn't support string formatting in EF LINQ)
        var rawTrends = await _context.JobRequests
            .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
            .Select(g => new { Year = g.Key.Year, Month = g.Key.Month, Count = g.Count() })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .Take(12)
            .ToListAsync();

        stats.MonthlyTrends = rawTrends.Select(t => new MonthlyTrend
        {
            Month = $"{t.Year}-{t.Month:D2}",
            Count = t.Count
        }).ToList();

        return stats;
    }
}
