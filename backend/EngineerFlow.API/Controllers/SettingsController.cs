using Microsoft.AspNetCore.Mvc;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public SettingsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>Automated SQLite Database Backup (Compliance Feature)</summary>
    [HttpGet("backup")]
    public IActionResult DownloadDatabaseBackup()
    {
        // NOTE: In a true production app, this would require strict [Authorize(Roles = "Admin")]
        var dbPath = Environment.GetEnvironmentVariable("DB_PATH") 
                     ?? Path.Combine(AppContext.BaseDirectory, "engineerflow.db");

        if (!System.IO.File.Exists(dbPath))
            return NotFound("Database file not found.");

        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var fileName = $"EngineerFlow_Snapshot_{timestamp}.db";

        var bytes = System.IO.File.ReadAllBytes(dbPath);
        return File(bytes, "application/octet-stream", fileName);
    }
}
