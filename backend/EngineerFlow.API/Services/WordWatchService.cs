namespace EngineerFlow.API.Services;

public interface IWordWatchService
{
    (bool IsFlagged, string? Reason) AnalyzeText(string? text);
}

public class WordWatchService : IWordWatchService
{
    private readonly Dictionary<string, string> _watchlist = new(StringComparer.OrdinalIgnoreCase)
    {
        { "security", "Contains sensitive keyword: 'security'" },
        { "breach", "High Risk keyword detected: 'breach'" },
        { "confidential", "Sensitive data flag: 'confidential'" },
        { "password", "Credentials exposed: 'password'" },
        { "exploit", "Vulnerability keyword detected: 'exploit'" },
        { "leak", "Data integrity keyword: 'leak'" },
        { "hack", "Threat keyword: 'hack'" },
        { "bypass", "Security perimeter keyword: 'bypass'" }
    };

    public (bool IsFlagged, string? Reason) AnalyzeText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return (false, null);

        var normalized = text.ToLowerInvariant();
        List<string> triggeredReasons = new();

        foreach (var kvp in _watchlist)
        {
            if (normalized.Contains(kvp.Key))
            {
                triggeredReasons.Add(kvp.Value);
            }
        }

        if (triggeredReasons.Any())
        {
            return (true, string.Join(" | ", triggeredReasons));
        }

        return (false, null);
    }
}
