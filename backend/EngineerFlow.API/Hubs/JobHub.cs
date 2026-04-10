using Microsoft.AspNetCore.SignalR;
using EngineerFlow.API.Models;

namespace EngineerFlow.API.Hubs;

public interface IJobClient
{
    Task JobCreated(JobRequest job);
    Task JobUpdated(JobRequest job);
    Task JobDeleted(int id);
    Task StatusUpdated(int id, RequestStatus status);
    Task AuditEntryCreated(AuditTrailEntry entry);
}

public class JobHub : Hub<IJobClient>
{
    public async Task JoinJobUpdates()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "JobUpdates");
    }

    public async Task LeaveJobUpdates()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "JobUpdates");
    }
}

