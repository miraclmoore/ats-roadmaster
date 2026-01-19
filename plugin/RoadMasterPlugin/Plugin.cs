using Newtonsoft.Json;
using RoadMasterPlugin.Models;
using SCSSdkClient;
using SCSSdkClient.Object;

namespace RoadMasterPlugin;

public class Plugin
{
    private readonly ApiClient apiClient = new();
    private SCSSdkTelemetry? telemetry;
    private Job? currentJob = null;
    private bool isRunning = false;
    private SCSTelemetry? lastTelemetry = null;

    public static async Task Main(string[] args)
    {
        var plugin = new Plugin();
        await plugin.Start();
    }

    public async Task Start()
    {
        Console.WriteLine("RoadMaster Pro - ATS Telemetry Plugin");
        Console.WriteLine("==========================================\n");

        // Load configuration
        var config = LoadConfig();
        if (string.IsNullOrWhiteSpace(config.ApiKey) || config.ApiKey == "rm_YOUR_API_KEY_HERE")
        {
            Console.WriteLine("[ERROR] API key not configured!");
            Console.WriteLine("   Please edit config.json and add your API key from the dashboard.");
            Console.WriteLine($"   Config file location: {Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json")}");
            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
            return;
        }

        apiClient.Initialize(config.ApiKey, config.ApiUrl);
        Console.WriteLine($"[OK] API configured: {config.ApiUrl}");

        // Initialize RenCloud SDK telemetry
        Console.WriteLine("[...] Connecting to ATS via RenCloud SDK...");

        try
        {
            telemetry = new SCSSdkTelemetry();

            if (telemetry.Error != null)
            {
                Console.WriteLine($"[ERROR] Cannot connect to American Truck Simulator");
                Console.WriteLine($"   Error: {telemetry.Error.Message}");
                Console.WriteLine("   Make sure:");
                Console.WriteLine("   1. ATS is running");
                Console.WriteLine("   2. RenCloud scs-telemetry.dll is installed in:");
                Console.WriteLine("      [Steam]\\steamapps\\common\\American Truck Simulator\\bin\\win_x64\\plugins\\");
                Console.WriteLine("   3. You accepted the SDK activation popup in ATS");
                Console.WriteLine("\nPress any key to exit...");
                Console.ReadKey();
                return;
            }

            Console.WriteLine("[OK] Connected to RenCloud SDK telemetry\n");
            Console.WriteLine("Monitoring telemetry data...\n");
            Console.WriteLine("Waiting for game data (enter the game world to start receiving data)...\n");

            isRunning = true;

            // Subscribe to telemetry events
            telemetry.Data += OnTelemetryData;
            telemetry.JobStarted += OnJobStarted;
            telemetry.JobDelivered += OnJobDelivered;
            telemetry.JobCancelled += OnJobCancelled;

            // Keep running until user presses a key
            Console.WriteLine("Press any key to stop the plugin...\n");
            Console.ReadKey();

            Stop();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to initialize telemetry: {ex.Message}");
            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }

    public void Stop()
    {
        isRunning = false;

        if (telemetry != null)
        {
            telemetry.Data -= OnTelemetryData;
            telemetry.JobStarted -= OnJobStarted;
            telemetry.JobDelivered -= OnJobDelivered;
            telemetry.JobCancelled -= OnJobCancelled;
            telemetry.Dispose();
        }

        Console.WriteLine("\n[OK] Plugin stopped");
    }

    private async void OnTelemetryData(SCSTelemetry data, bool newTimestamp)
    {
        if (!isRunning || !newTimestamp)
            return;

        lastTelemetry = data;

        // Only send telemetry if SDK is active (game is running, not in menu)
        if (!data.SdkActive)
            return;

        // Send telemetry to API
        await apiClient.SendTelemetry(currentJob?.Id, data);
    }

    private async void OnJobStarted(object? sender, EventArgs e)
    {
        if (!isRunning || lastTelemetry == null)
            return;

        var data = lastTelemetry;
        var sourceCity = data.JobValues.CitySource;
        var destCity = data.JobValues.CityDestination;
        var cargo = data.JobValues.CargoValues.Name;
        var income = (int)data.JobValues.Income;
        var distance = (int)data.JobValues.PlannedDistanceKm;

        if (!string.IsNullOrWhiteSpace(sourceCity) && !string.IsNullOrWhiteSpace(destCity))
        {
            currentJob = await apiClient.StartJob(
                sourceCity,
                destCity,
                cargo,
                income,
                distance
            );

            if (currentJob != null)
            {
                Console.WriteLine($"[JOB] Started: {currentJob.Route}");
                Console.WriteLine($"      Cargo: {cargo}");
                Console.WriteLine($"      Income: ${income:N0}");
                Console.WriteLine($"      Distance: {distance} km\n");
            }
        }
    }

    private async void OnJobDelivered(object? sender, EventArgs e)
    {
        if (!isRunning || currentJob == null)
            return;

        bool deliveredLate = false; // SDK doesn't directly expose this in the event
        var success = await apiClient.CompleteJob(currentJob.Id, deliveredLate);

        if (success)
        {
            Console.WriteLine($"[OK] Job completed: {currentJob.Route}");
            Console.WriteLine($"     Profit calculated and saved to dashboard\n");
        }

        currentJob = null;
    }

    private void OnJobCancelled(object? sender, EventArgs e)
    {
        if (!isRunning || currentJob == null)
            return;

        Console.WriteLine($"[CANCELLED] Job cancelled: {currentJob.Route}\n");
        currentJob = null;
    }

    private Config LoadConfig()
    {
        try
        {
            var configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");

            if (!File.Exists(configPath))
            {
                Console.WriteLine($"[WARN] Config file not found at: {configPath}");
                Console.WriteLine("   Creating default config...");

                var defaultConfig = new Config
                {
                    ApiKey = "rm_YOUR_API_KEY_HERE",
                    ApiUrl = "http://localhost:3000"
                };

                File.WriteAllText(configPath, JsonConvert.SerializeObject(defaultConfig, Formatting.Indented));
                return defaultConfig;
            }

            var json = File.ReadAllText(configPath);
            return JsonConvert.DeserializeObject<Config>(json) ?? new Config();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading config: {ex.Message}");
            return new Config();
        }
    }
}
