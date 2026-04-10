using EngineerFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EngineerFlow.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<JobRequest> JobRequests => Set<JobRequest>();
    public DbSet<CompletionEvent> CompletionEvents => Set<CompletionEvent>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<AuditTrailEntry> AuditTrailEntries => Set<AuditTrailEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.RequesterName).IsRequired().HasMaxLength(100);
            
            entity.HasOne(e => e.CompletionEvent)
                  .WithOne(c => c.JobRequest)
                  .HasForeignKey<CompletionEvent>(c => c.JobRequestId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AssignedUser)
                  .WithMany()
                  .HasForeignKey(e => e.AssignedUserId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Attachments)
                  .WithOne()
                  .HasForeignKey(a => a.JobRequestId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.ActivityLogs)
                  .WithOne()
                  .HasForeignKey(l => l.JobRequestId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<Attachment>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<CompletionEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CompletedBy).IsRequired().HasMaxLength(100);
        });

        // Global audit trail — NO FK relationship, intentionally immutable
        modelBuilder.Entity<AuditTrailEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.EntityType);
            entity.HasIndex(e => e.Action);
        });
    }
}