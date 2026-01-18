namespace RoadMasterPlugin.Models;

public class JobStartResponse
{
    public bool success { get; set; }
    public string job_id { get; set; } = string.Empty;
}

public class JobCompleteResponse
{
    public bool success { get; set; }
}

public class TelemetryResponse
{
    public bool success { get; set; }
}
