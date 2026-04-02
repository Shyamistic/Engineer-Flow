using EngineerFlow.API.Data;
using EngineerFlow.API.DTOs;
using EngineerFlow.API.Models;
using EngineerFlow.API.Services;
using EngineerFlow.API.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Moq;
using Xunit;

namespace EngineerFlow.Tests;

public class JobRequestServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly Mock<IHubContext<JobHub, IJobClient>> _hubMock;
    private readonly Mock<IHubClients<IJobClient>> _clientsMock;
    private readonly Mock<IJobClient> _clientMock;
    private readonly JobRequestService _service;

    public JobRequestServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);

        _hubMock = new Mock<IHubContext<JobHub, IJobClient>>();
        _clientsMock = new Mock<IHubClients<IJobClient>>();
        _clientMock = new Mock<IJobClient>();

        // Setup SignalR Mocks
        _hubMock.Setup(h => h.Clients).Returns(_clientsMock.Object);
        _clientsMock.Setup(c => c.Group(It.IsAny<string>())).Returns(_clientMock.Object);

        _service = new JobRequestService(_db, _hubMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateJob_AndNotifyHub()
    {
        // Arrange
        var dto = new CreateJobRequestDto("Test Job", "Description", "Requester", "Assignee", Priority.High, "Bug", null);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Job", result.Title);
        Assert.Equal(RequestStatus.Open, result.Status);
        
        var jobInDb = await _db.JobRequests.FindAsync(result.Id);
        Assert.NotNull(jobInDb);
        _clientMock.Verify(c => c.JobCreated(It.IsAny<JobRequest>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldUpdateStatus_AndNotifyHub()
    {
        // Arrange
        var job = new JobRequest { Title = "Test", Description = "Desc", RequesterName = "Req", Status = RequestStatus.Open };
        _db.JobRequests.Add(job);
        await _db.SaveChangesAsync();

        // Act
        var result = await _service.UpdateStatusAsync(job.Id, RequestStatus.InProgress);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(RequestStatus.InProgress, result.Status);
        _clientMock.Verify(c => c.JobUpdated(It.IsAny<JobRequest>()), Times.Once);
    }

    [Fact]
    public async Task RecordCompletionAsync_ShouldCompleteJob_AndRecordEvent()
    {
        // Arrange
        var job = new JobRequest { Title = "Test", Description = "Desc", RequesterName = "Req", Status = RequestStatus.Open };
        _db.JobRequests.Add(job);
        await _db.SaveChangesAsync();

        var dto = new RecordCompletionDto("Sarah", "Fixed the bug", 120, "All good");

        // Act
        var result = await _service.RecordCompletionAsync(job.Id, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(RequestStatus.Completed, result.Status);
        Assert.NotNull(result.CompletionEvent);
        Assert.Equal("Sarah", result.CompletionEvent.CompletedBy);
        _clientMock.Verify(c => c.JobUpdated(It.IsAny<JobRequest>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveJob_AndNotifyHub()
    {
        // Arrange
        var job = new JobRequest { Title = "To Delete", Description = "Desc", RequesterName = "Req" };
        _db.JobRequests.Add(job);
        await _db.SaveChangesAsync();

        // Act
        var result = await _service.DeleteAsync(job.Id);

        // Assert
        Assert.True(result);
        var jobInDb = await _db.JobRequests.FindAsync(job.Id);
        Assert.Null(jobInDb);
        _clientMock.Verify(c => c.JobDeleted(job.Id), Times.Once);
    }

    public void Dispose()
    {
        _db.Database.EnsureDeleted();
        _db.Dispose();
    }
}
