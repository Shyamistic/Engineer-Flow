using EngineerFlow.API.Data;
using EngineerFlow.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly AppDbContext _context;

    public ExportController(IExportService exportService, AppDbContext context)
    {
        _exportService = exportService;
        _context = context;
    }

    [HttpGet("jobs/pdf")]
    public async Task<IActionResult> ExportPdf()
    {
        var jobs = await _context.JobRequests.ToListAsync();
        var pdf = _exportService.GeneratePdfReport(jobs);
        return File(pdf, "application/pdf", $"JobRequests_{DateTime.Now:yyyyMMdd}.pdf");
    }

    [HttpGet("jobs/excel")]
    public async Task<IActionResult> ExportExcel()
    {
        var jobs = await _context.JobRequests.ToListAsync();
        var excel = _exportService.GenerateExcelReport(jobs);
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"JobRequests_{DateTime.Now:yyyyMMdd}.xlsx");
    }
}
