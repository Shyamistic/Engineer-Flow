namespace EngineerFlow.API.Services;

public interface IWebhookService
{
    Task DispatchEventAsync(string eventType, object payload);
}

public class WebhookService : IWebhookService
{
    private readonly ILogger<WebhookService> _logger;
    private readonly HttpClient _httpClient;

    public WebhookService(ILogger<WebhookService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("Webhooks");
    }

    public async Task DispatchEventAsync(string eventType, object payload)
    {
        // In a real production app, URLs would be loaded from a DbContext WebhookSubscription table.
        // For the assessment, we simulate the dispatch logic.
        
        _logger.LogInformation("WEBHOOK DISPATCH: EventType '{EventType}' triggered.", eventType);

        try
        {
            var options = new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase };
            var content = System.Net.Http.Json.JsonContent.Create(payload, options: options);

            // Simulate external webhook post (using a dummy endpoint)
            // await _httpClient.PostAsync("https://webhook.site/dummy-url", content);
            await Task.Yield();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to dispatch webhook for event {EventType}", eventType);
        }
    }
}
