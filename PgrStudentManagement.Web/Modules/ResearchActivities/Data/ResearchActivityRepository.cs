using System.Text.Json;
using PgrStudentManagement.Web.Modules.ResearchActivities.Models;

namespace PgrStudentManagement.Web.Modules.ResearchActivities.Data;

public class ResearchActivityRepository
{
    private const string DefaultRelativeFilePath =
        "Modules/ResearchActivities/Data/research-activities.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private readonly string _filePath;
    private readonly List<ResearchActivity> _activities;

    public ResearchActivityRepository(IConfiguration? configuration = null)
    {
        var configuredPath = configuration?["ResearchActivityData:FilePath"];
        _filePath = ResolveFilePath(
            string.IsNullOrWhiteSpace(configuredPath)
                ? DefaultRelativeFilePath
                : configuredPath);

        _activities = LoadActivities(_filePath);
    }

    public Task<IReadOnlyList<ResearchActivity>> GetAllAsync()
    {
        IReadOnlyList<ResearchActivity> all = _activities
            .OrderBy(activity => activity.ActivityDate)
            .ToList();

        return Task.FromResult(all);
    }

    public Task<IReadOnlyList<ResearchActivity>> GetForStudentAsync(string studentNumber)
    {
        IReadOnlyList<ResearchActivity> result = _activities
            .Where(activity => activity.StudentNumber == studentNumber)
            .OrderBy(activity => activity.ActivityDate)
            .ToList();

        return Task.FromResult(result);
    }

    public Task AddAsync(ResearchActivity activity)
    {
        ArgumentNullException.ThrowIfNull(activity);

        NormalizeDetails(activity);
        _activities.Add(activity);

        return Task.CompletedTask;
    }

    private static string ResolveFilePath(string path)
    {
        if (Path.IsPathRooted(path))
        {
            return path;
        }

        var currentDirCandidate = Path.Combine(Directory.GetCurrentDirectory(), path);
        if (File.Exists(currentDirCandidate))
        {
            return currentDirCandidate;
        }

        return Path.Combine(AppContext.BaseDirectory, path);
    }

    private static List<ResearchActivity> LoadActivities(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return [];
        }

        var json = File.ReadAllText(filePath);
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        var activities = JsonSerializer.Deserialize<List<ResearchActivity>>(json, JsonOptions)
            ?? [];

        foreach (var activity in activities)
        {
            NormalizeDetails(activity);
        }

        return activities;
    }

    private static void NormalizeDetails(ResearchActivity activity)
    {
        if (activity.Details is null || activity.Details.Count == 0)
        {
            return;
        }

        var normalized = new Dictionary<string, object>(activity.Details.Count);
        foreach (var (key, value) in activity.Details)
        {
            normalized[key] = ConvertValue(value);
        }

        activity.Details = normalized;
    }

    private static object ConvertValue(object value)
    {
        if (value is not JsonElement element)
        {
            return value;
        }

        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString() ?? string.Empty,
            JsonValueKind.Number when element.TryGetInt64(out var intValue) => intValue,
            JsonValueKind.Number => element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Array => element
                .EnumerateArray()
                .Select(item => ConvertValue(item))
                .ToArray(),
            JsonValueKind.Object => element
                .EnumerateObject()
                .ToDictionary(prop => prop.Name, prop => ConvertValue(prop.Value)),
            _ => string.Empty
        };
    }
}
