using EngineerFlow.API.Data;
using EngineerFlow.API.Services;
using EngineerFlow.API.Hubs;
using EngineerFlow.API.Middleware;
using EngineerFlow.API.Settings;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Configure Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() 
                 ?? new JwtSettings { Secret = "YourSuperSecretKeyGoesHereMinimum128Bits", Issuer = "EngineerFlow", Audience = "EngineerFlow" };
builder.Services.AddSingleton(jwtSettings);

// SQLite — portable, no install needed
// In Docker, DB_PATH env var points to the mounted volume
var dbPath = Environment.GetEnvironmentVariable("DB_PATH") 
             ?? Path.Combine(AppContext.BaseDirectory, "engineerflow.db");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite($"Data Source={dbPath}"));

// Services
builder.Services.AddScoped<IJobRequestService, JobRequestService>();
builder.Services.AddScoped<IDataSeedService, DataSeedService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IFileService, FileService>();

// SignalR
builder.Services.AddSignalR();

// Rate Limiting (Production Feature)
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            }));
    
    options.RejectionStatusCode = 429;
});

// Authentication
builder.Services.AddAuthentication(opt => {
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(opt => {
    opt.RequireHttpsMetadata = false;
    opt.SaveToken = true;
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings.Secret)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // Support SignalR Auth via QueryString
    opt.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi(opt =>
{
    opt.AddDocumentTransformer((doc, ctx, ct) =>
    {
        doc.Info.Title = "EngineerFlow API — Production Ready";
        doc.Info.Version = "v2.0.0";
        doc.Info.Description = "Enterprise Engineering Job Request Management System with Real-Time Capabilities.";
        doc.Info.Contact = new() { Name = "EngineerFlow Team", Email = "support@engineerflow.com" };
        return Task.CompletedTask;
    });
});

builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Dev: allow Angular dev server
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // Production: same-origin (Angular is served from .NET wwwroot)
            // Still allow credentials for SignalR
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    }));

// Response Compression (Production Feature)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("db");

var app = builder.Build();

// Security Headers (Production Feature)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    await next();
});

// Custom Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Rate Limiting
app.UseRateLimiter();

// Response Compression
app.UseResponseCompression();

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = (check) => check.Tags.Contains("ready"),
});

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var seedService = scope.ServiceProvider.GetRequiredService<IDataSeedService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        await db.Database.MigrateAsync();
        await seedService.SeedAsync();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Migration error");
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(opt => 
    {
        opt.WithTitle("EngineerFlow API");
        opt.WithTheme(ScalarTheme.Purple);
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseDefaultFiles(); // Modern SPA convenience
app.UseStaticFiles(); // For file uploads + Angular SPA

app.MapControllers();
app.MapHub<JobHub>("/hubs/jobs");

// SPA fallback — serve index.html for all non-API routes (production)
app.MapFallbackToFile("index.html");

app.Logger.LogInformation("EngineerFlow Production API started on http://localhost:5000");
app.Run();
