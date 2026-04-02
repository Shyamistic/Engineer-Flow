using EngineerFlow.API.DTOs;
using EngineerFlow.API.Models;

namespace EngineerFlow.API.Services;

public interface IJobRequestService
{
    Task<IEnumerable<JobRequestResponseDto>> GetAllAsync(string? status, string? priority, string? search, string? sortBy, bool descending);
    Task<JobRequestResponseDto?> GetByIdAsync(int id);
    Task<JobRequestResponseDto> CreateAsync(CreateJobRequestDto dto);
    Task<JobRequestResponseDto?> UpdateAsync(int id, UpdateJobRequestDto dto);
    Task<JobRequestResponseDto?> UpdateStatusAsync(int id, RequestStatus newStatus);
    Task<JobRequestResponseDto?> RecordCompletionAsync(int id, RecordCompletionDto dto);
    Task<bool> DeleteAsync(int id);
    Task<JobRequestSummaryDto> GetSummaryAsync();
}
