using System.Text;
using Newtonsoft.Json;
using RoadMasterPlugin.Models;

namespace RoadMasterPlugin;

public class Plugin
{
    private readonly TelemetryReader reader = new();
    private readonly ApiClient apiClient = new();
    private Job? currentJob = null;
    private Timer? telemetryTimer;
    private int previousJobIncome = 0;
    private bool isRunning = false;

    public static async Task Main(string[] args)
    {
        var plugin = new Plugin();
        await plugin.Start();

        Console.WriteLine("\nPress any key to exit...");
        Console.ReadKey();

        plugin.Stop();
    }

    public async Task Start()
    {
        Console.WriteLine("🚛 RoadMaster Pro - ATS Telemetry Plugin");
        Console.WriteLine("==========================================\n");

        // Load configuration
        var config = LoadConfig();
        if (string.IsNullOrWhiteSpace(config.ApiKey) || config.ApiKey == "rm_YOUR_API_KEY_HERE")
        {
            Console.WriteLine("❌ API key not configured!");
            Console.WriteLine("   Please edit config.json and add your API key from the dashboard.");
            Console.WriteLine($"   Config file location: {Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json")}");
            return;
        }

        apiClient.Initialize(config.ApiKey, config.ApiUrl);
        Console.WriteLine($"✅ API configured: {config.ApiUrl}");

        // Initialize telemetry reader
        if (!reader.Initialize())
        {
            Console.WriteLine("❌ Cannot connect to American Truck Simulator");
            Console.WriteLine("   Make sure:");
            Console.WriteLine("   1. ATS is running");
            Console.WriteLine("   2. You are in-game (not in menu)");
            Console.WriteLine("   3. SCS SDK is enabled in ATS");
            return;
        }

        Console.WriteLine("✅ Connected to American Truck Simulator\n");
        Console.WriteLine("Monitoring telemetry data (1Hz sampling)...\n");

        isRunning = true;

        // Send telemetry every 1 second
        telemetryTimer = new Timer(async _ => await SendTelemetry(), null, 0, 1000);

        // Keep running
        await Task.Delay(Timeout.Infinite);
    }

    public void Stop()
    {
        isRunning = false;
        telemetryTimer?.Dispose();
        reader.Dispose();
        Console.WriteLine("\n✅ Plugin stopped");
    }

    private async Task SendTelemetry()
    {
        if (!isRunning)
            return;

        var data = reader.ReadTelemetry();
        if (data == null)
            return;

        // Detect job started (income changed from 0 to positive value)
        if (currentJob == null && data.Value.JobIncome > 0 && previousJobIncome == 0)
        {
            var sourceCity = GetString(data.Value.SourceCity);
            var destCity = GetString(data.Value.DestinationCity);
            var cargo = GetString(data.Value.CargoName);

            if (!string.IsNullOrWhiteSpace(sourceCity) && !string.IsNullOrWhiteSpace(destCity))
            {
                currentJob = await apiClient.StartJob(
                    sourceCity,
                    destCity,
                    cargo,
                    data.Value.JobIncome,
                    data.Value.JobDistance
                );

                if (currentJob != null)
                {
                    Console.WriteLine($"🚛 Job started: {currentJob.Route}");
                    Console.WriteLine($"   Cargo: {cargo}");
                    Console.WriteLine($"   Income: ${data.Value.JobIncome:N0}");
                    Console.WriteLine($"   Distance: {data.Value.JobDistance} km\n");
                }
            }
        }

        // Detect job completed (income changed from positive to 0)
        if (currentJob != null && data.Value.JobIncome == 0 && previousJobIncome > 0)
        {
            bool deliveredLate = data.Value.JobDeliveredLate == 1;
            var success = await apiClient.CompleteJob(currentJob.Id, deliveredLate);

            if (success)
            {
                Console.WriteLine($"✅ Job completed: {currentJob.Route}");
                Console.WriteLine($"   Status: {(deliveredLate ? "⏰ Late Delivery" : "✓ On Time")}");
                Console.WriteLine($"   Profit calculated and saved to dashboard\n");
            }

            currentJob = null;
        }

        previousJobIncome = data.Value.JobIncome;

        // Always send telemetry
        await apiClient.SendTelemetry(currentJob?.Id, data.Value);
    }

    private string GetString(byte[] bytes)
    {
        return Encoding.UTF8.GetString(bytes).TrimEnd('\0');
    }

    private Config LoadConfig()
    {
        try
        {
            var configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");

            if (!File.Exists(configPath))
            {
                Console.WriteLine($"⚠️  Config file not found at: {configPath}");
                Console.WriteLine("   Creating default config...");

                var defaultConfig = new Config
                {
                    ApiKey = "rm_YOUR_API_KEY_HERE",
                    ApiUrl = "http://localhost:3002"
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
