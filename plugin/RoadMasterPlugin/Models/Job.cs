namespace RoadMasterPlugin.Models;

public class Job
{
    public string Id { get; set; } = string.Empty;
    public string SourceCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public string Route => $"{SourceCity} → {DestinationCity}";
}
