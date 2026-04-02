using EngineerFlow.API.Data;
using EngineerFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EngineerFlow.API.Services;

public interface IDataSeedService
{
    Task SeedAsync();
}

public class DataSeedService : IDataSeedService
{
    private readonly AppDbContext _db;
    private readonly ILogger<DataSeedService> _logger;

    public DataSeedService(AppDbContext db, ILogger<DataSeedService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await _db.Database.EnsureCreatedAsync();

            if (await _db.Users.AnyAsync())
            {
                _logger.LogInformation("Database already seeded");
                return;
            }

            _logger.LogInformation("Seeding database with sample data...");

            // Seed Users
            var admin = new User { Username = "admin", FullName = "System Admin", Role = UserRole.Admin, PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123") };
            var engineer = new User { Username = "engineer", FullName = "Lead Engineer", Role = UserRole.Engineer, PasswordHash = BCrypt.Net.BCrypt.HashPassword("engineer123") };
            await _db.Users.AddRangeAsync(admin, engineer);
            await _db.SaveChangesAsync();

            var requests = GenerateSampleRequests(engineer.Id);
            await _db.JobRequests.AddRangeAsync(requests);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Successfully seeded {requests.Count} job requests and default users");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            throw;
        }
    }

    private List<JobRequest> GenerateSampleRequests(int engineerId)
    {
        var random = new Random(42); // Fixed seed for consistent data
        var requests = new List<JobRequest>();

        // Engineering teams and members
        var teams = new[]
        {
            ("Frontend", new[] { "Sarah Chen", "Mike Rodriguez", "Emma Thompson", "David Kim" }),
            ("Backend", new[] { "Alex Johnson", "Maria Garcia", "James Wilson", "Lisa Zhang" }),
            ("DevOps", new[] { "Tom Anderson", "Rachel Green", "Chris Brown", "Amy Davis" }),
            ("QA", new[] { "John Smith", "Jennifer Lee", "Robert Taylor", "Michelle Wang" }),
            ("Security", new[] { "Kevin O'Connor", "Priya Patel", "Mark Stevens", "Anna Kowalski" }),
            ("Data", new[] { "Daniel Martinez", "Sophie Turner", "Ryan Clark", "Zoe Adams" })
        };

        var allEngineers = teams.SelectMany(t => t.Item2).ToArray();
        var requesters = new[] 
        { 
            "Product Manager", "Engineering Manager", "CTO", "Customer Support",
            "Sales Team", "Marketing", "Legal", "HR", "Finance", "Operations"
        };

        // Sample request templates
        var requestTemplates = new[]
        {
            // Critical Issues
            new { Title = "Production API Gateway Down", Description = "The main API gateway is returning 503 errors for all requests. Customer-facing applications are completely unavailable. Need immediate investigation and resolution.", Priority = Priority.Critical, Category = "Infrastructure", DaysOffset = -1 },
            new { Title = "Database Connection Pool Exhausted", Description = "Application servers are unable to connect to the primary database due to connection pool exhaustion. This is affecting all user transactions.", Priority = Priority.Critical, Category = "Infrastructure", DaysOffset = 0 },
            new { Title = "Security Vulnerability in Authentication", Description = "Critical security flaw discovered in JWT token validation that could allow unauthorized access to user accounts. Requires immediate patching.", Priority = Priority.Critical, Category = "Security", DaysOffset = -2 },
            
            // High Priority
            new { Title = "Implement OAuth 2.0 Integration", Description = "Add OAuth 2.0 support for third-party authentication providers (Google, Microsoft, GitHub) to improve user onboarding experience.", Priority = Priority.High, Category = "Feature Request", DaysOffset = 5 },
            new { Title = "Performance Optimization for Search API", Description = "Search queries are taking 3-5 seconds to complete. Need to optimize database queries and implement caching to reduce response time to under 500ms.", Priority = Priority.High, Category = "Performance", DaysOffset = 7 },
            new { Title = "Implement Real-time Notifications", Description = "Add WebSocket-based real-time notifications for user actions, comments, and system events to improve user engagement.", Priority = Priority.High, Category = "Feature Request", DaysOffset = 10 },
            new { Title = "Fix Memory Leak in Background Jobs", Description = "Background job processor is consuming increasing amounts of memory over time, causing server restarts every few days.", Priority = Priority.High, Category = "Bug Fix", DaysOffset = 3 },
            
            // Medium Priority
            new { Title = "Upgrade React to Latest Version", Description = "Update React from v17 to v18 to take advantage of new features like concurrent rendering and automatic batching.", Priority = Priority.Medium, Category = "Maintenance", DaysOffset = 14 },
            new { Title = "Add API Rate Limiting", Description = "Implement rate limiting on public APIs to prevent abuse and ensure fair usage across all clients.", Priority = Priority.Medium, Category = "Feature Request", DaysOffset = 12 },
            new { Title = "Improve Error Handling in Payment Flow", Description = "Payment processing errors are not being handled gracefully, causing confusion for users. Need better error messages and retry logic.", Priority = Priority.Medium, Category = "Bug Fix", DaysOffset = 8 },
            new { Title = "Create API Documentation Portal", Description = "Build a comprehensive API documentation portal with interactive examples and code samples for external developers.", Priority = Priority.Medium, Category = "Documentation", DaysOffset = 20 },
            new { Title = "Implement Dark Mode Theme", Description = "Add dark mode support across the entire application with user preference persistence and system theme detection.", Priority = Priority.Medium, Category = "Feature Request", DaysOffset = 15 },
            new { Title = "Set up Automated Testing Pipeline", Description = "Configure CI/CD pipeline with automated unit, integration, and end-to-end tests to improve code quality and deployment confidence.", Priority = Priority.Medium, Category = "Infrastructure", DaysOffset = 18 },
            
            // Low Priority
            new { Title = "Update Dependencies to Latest Versions", Description = "Review and update all npm and NuGet packages to their latest stable versions to ensure security and performance improvements.", Priority = Priority.Low, Category = "Maintenance", DaysOffset = 30 },
            new { Title = "Refactor Legacy Code in User Module", Description = "Clean up and refactor the user management module to improve maintainability and follow current coding standards.", Priority = Priority.Low, Category = "Maintenance", DaysOffset = 25 },
            new { Title = "Add Accessibility Improvements", Description = "Implement WCAG 2.1 AA compliance improvements including keyboard navigation, screen reader support, and color contrast fixes.", Priority = Priority.Low, Category = "Feature Request", DaysOffset = 35 },
            new { Title = "Create Developer Onboarding Guide", Description = "Write comprehensive documentation for new developers including setup instructions, architecture overview, and coding guidelines.", Priority = Priority.Low, Category = "Documentation", DaysOffset = 40 },
            new { Title = "Optimize Bundle Size", Description = "Analyze and reduce JavaScript bundle size by implementing code splitting, tree shaking, and removing unused dependencies.", Priority = Priority.Low, Category = "Performance", DaysOffset = 28 },
            new { Title = "Add Monitoring Dashboard", Description = "Create a monitoring dashboard to track application performance, error rates, and user metrics in real-time.", Priority = Priority.Low, Category = "Feature Request", DaysOffset = 45 }
        };

        var baseDate = DateTime.UtcNow.AddDays(-30);

        for (int i = 0; i < requestTemplates.Length; i++)
        {
            var template = requestTemplates[i];
            var createdAt = baseDate.AddDays(random.Next(0, 30));
            var dueDate = template.Priority == Priority.Critical 
                ? createdAt.AddHours(random.Next(2, 8))
                : template.Priority == Priority.High
                    ? createdAt.AddDays(random.Next(1, 5))
                    : template.Priority == Priority.Medium
                        ? createdAt.AddDays(random.Next(3, 14))
                        : createdAt.AddDays(random.Next(7, 30));

            var status = DetermineStatus(template.Priority, createdAt, random);
            var assignedTeam = teams[random.Next(teams.Length)];
            var assignedEngineer = assignedTeam.Item2[random.Next(assignedTeam.Item2.Length)];
            var requester = requesters[random.Next(requesters.Length)];

            var request = new JobRequest
            {
                Title = template.Title,
                Description = template.Description,
                RequesterName = requester,
                AssignedTo = status != RequestStatus.Open ? assignedEngineer : null,
                Priority = template.Priority,
                Status = status,
                Category = template.Category,
                CreatedAt = createdAt,
                UpdatedAt = createdAt.AddHours(random.Next(1, 48)),
                DueDate = dueDate
            };

            // Add completion events for completed requests
            if (status == RequestStatus.Completed)
            {
                request.CompletionEvent = new CompletionEvent
                {
                    CompletedBy = assignedEngineer,
                    CompletedAt = request.UpdatedAt.AddHours(random.Next(1, 24)),
                    Notes = GenerateCompletionNotes(template.Category, random),
                    DurationMinutes = random.Next(30, 480), // 30 minutes to 8 hours
                    ResolutionSummary = GenerateResolutionSummary(template.Category, random)
                };
            }

            requests.Add(request);
        }

        // Add some additional requests with variations
        for (int i = 0; i < 15; i++)
        {
            var template = requestTemplates[random.Next(requestTemplates.Length)];
            var createdAt = DateTime.UtcNow.AddDays(random.Next(-7, 0));
            
            var request = new JobRequest
            {
                Title = $"{template.Title} (Variant {i + 1})",
                Description = $"{template.Description} Additional context and requirements for this specific instance.",
                RequesterName = requesters[random.Next(requesters.Length)],
                AssignedTo = random.Next(3) == 0 ? null : allEngineers[random.Next(allEngineers.Length)],
                Priority = (Priority)random.Next(4),
                Status = (RequestStatus)random.Next(5),
                Category = template.Category,
                CreatedAt = createdAt,
                UpdatedAt = createdAt.AddHours(random.Next(1, 168)),
                DueDate = createdAt.AddDays(random.Next(1, 21))
            };

            requests.Add(request);
        }

        return requests;
    }

    private RequestStatus DetermineStatus(Priority priority, DateTime createdAt, Random random)
    {
        var daysSinceCreated = (DateTime.UtcNow - createdAt).TotalDays;

        return priority switch
        {
            Priority.Critical => daysSinceCreated > 1 ? RequestStatus.Completed : RequestStatus.InProgress,
            Priority.High => daysSinceCreated > 5 ? RequestStatus.Completed : 
                           daysSinceCreated > 2 ? RequestStatus.InProgress : RequestStatus.Open,
            Priority.Medium => random.Next(4) switch
            {
                0 => RequestStatus.Open,
                1 => RequestStatus.InProgress,
                2 => RequestStatus.Completed,
                _ => RequestStatus.OnHold
            },
            Priority.Low => random.Next(5) switch
            {
                0 => RequestStatus.InProgress,
                1 => RequestStatus.Completed,
                2 => RequestStatus.Cancelled,
                _ => RequestStatus.Open
            },
            _ => RequestStatus.Open
        };
    }

    private string GenerateCompletionNotes(string category, Random random)
    {
        var notes = category switch
        {
            "Bug Fix" => new[]
            {
                "Root cause identified in the authentication middleware. Fixed by updating token validation logic.",
                "Issue was caused by race condition in concurrent requests. Implemented proper locking mechanism.",
                "Memory leak fixed by properly disposing database connections in the finally block."
            },
            "Feature Request" => new[]
            {
                "Feature implemented according to specifications. Added comprehensive unit tests and documentation.",
                "Successfully integrated with existing systems. Performance testing shows no degradation.",
                "Feature deployed to staging environment and tested by QA team. Ready for production release."
            },
            "Infrastructure" => new[]
            {
                "Infrastructure changes deployed successfully. Monitoring shows improved performance and stability.",
                "Migration completed without downtime. All services are running normally.",
                "Configuration updated and tested. System is now more resilient to failures."
            },
            "Security" => new[]
            {
                "Security vulnerability patched. Conducted security audit to ensure no similar issues exist.",
                "Implemented additional security measures and updated security documentation.",
                "Vulnerability fixed and security team has verified the solution."
            },
            _ => new[]
            {
                "Task completed successfully according to requirements.",
                "Implementation tested and verified by the team.",
                "Work completed and documentation updated."
            }
        };

        return notes[random.Next(notes.Length)];
    }

    private string GenerateResolutionSummary(string category, Random random)
    {
        var summaries = category switch
        {
            "Bug Fix" => new[]
            {
                "Fixed critical bug affecting user authentication",
                "Resolved performance issue in data processing",
                "Corrected error handling in payment flow"
            },
            "Feature Request" => new[]
            {
                "Successfully implemented new user dashboard",
                "Added real-time notification system",
                "Integrated third-party API for enhanced functionality"
            },
            "Infrastructure" => new[]
            {
                "Upgraded server infrastructure for better performance",
                "Implemented automated backup and recovery system",
                "Optimized database configuration for improved speed"
            },
            _ => new[]
            {
                "Task completed as requested",
                "Requirements fulfilled successfully",
                "Implementation meets all specifications"
            }
        };

        return summaries[random.Next(summaries.Length)];
    }
}