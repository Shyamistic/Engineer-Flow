using EngineerFlow.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize] // Enable this once frontend is ready
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("dashboard")]
    [Microsoft.AspNetCore.OutputCaching.OutputCache(Duration = 10)]
    public async Task<ActionResult<DashboardStats>> GetDashboardStats()
    {
        return Ok(await _analyticsService.GetDashboardStats());
    }
}
