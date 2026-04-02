using EngineerFlow.API.DTOs;
using EngineerFlow.API.Models;
using EngineerFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class JobRequestsController : ControllerBase
{
    private readonly IJobRequestService _service;

    public JobRequestsController(IJobRequestService service) => _service = service;

    /// <summary>Get all job requests with optional filtering and sorting</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobRequestResponseDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? search,
        [FromQuery] string? sortBy = "updatedAt",
        [FromQuery] bool descending = true)
        => Ok(await _service.GetAllAsync(status, priority, search, sortBy, descending));

    /// <summary>Get a single job request by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobRequestResponseDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new job request</summary>
    [HttpPost]
    public async Task<ActionResult<JobRequestResponseDto>> Create([FromBody] CreateJobRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an existing job request</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<JobRequestResponseDto>> Update(int id, [FromBody] UpdateJobRequestDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Update only the status of a job request</summary>
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<JobRequestResponseDto>> UpdateStatus(int id, [FromBody] RequestStatus newStatus)
    {
        var result = await _service.UpdateStatusAsync(id, newStatus);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Record a completion event (marks request as Done)</summary>
    [HttpPost("{id:int}/complete")]
    public async Task<ActionResult<JobRequestResponseDto>> RecordCompletion(int id, [FromBody] RecordCompletionDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.RecordCompletionAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Delete a job request</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>Get dashboard summary statistics</summary>
    [HttpGet("summary")]
    public async Task<ActionResult<JobRequestSummaryDto>> GetSummary()
        => Ok(await _service.GetSummaryAsync());
}