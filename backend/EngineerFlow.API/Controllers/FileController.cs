using EngineerFlow.API.Data;
using EngineerFlow.API.Models;
using EngineerFlow.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly AppDbContext _context;

    public FileController(IFileService fileService, AppDbContext context)
    {
        _fileService = fileService;
        _context = context;
    }

    [HttpPost("upload/{jobRequestId}")]
    public async Task<IActionResult> Upload(int jobRequestId, IFormFile file)
    {
        var job = await _context.JobRequests.FindAsync(jobRequestId);
        if (job == null) return NotFound();

        var path = await _fileService.SaveFileAsync(file, "jobs");
        var attachment = new Attachment
        {
            JobRequestId = jobRequestId,
            FileName = file.FileName,
            FilePath = path,
            ContentType = file.ContentType,
            FileSize = file.Length
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        return Ok(attachment);
    }
}
