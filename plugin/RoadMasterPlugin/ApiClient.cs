using System.Text;
using Newtonsoft.Json;
using RoadMasterPlugin.Models;

namespace RoadMasterPlugin;

public class ApiClient
{
    private readonly HttpClient client = new();
    private string apiUrl = string.Empty;
    private string apiKey = string.Empty;

    public void Initialize(string key, string baseUrl)
    {
        apiKey = key;
        apiUrl = baseUrl.TrimEnd('/');

        client.DefaultRequestHeaders.Clear();
        client.Timeout = TimeSpan.FromSeconds(10);
    }

    public async Task<Job?> StartJob(string sourceCity, string destCity, string cargo, int income, int distance)
    {
        try
        {
            var payload = new
            {
                api_key = apiKey,
                source_city = sourceCity,
                destination_city = destCity,
                cargo_type = cargo,
                income = income,
                distance = distance
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{apiUrl}/api/jobs/start", content);
            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Failed to start job: {response.StatusCode} - {responseText}");
                return null;
            }

            var result = JsonConvert.DeserializeObject<JobStartResponse>(responseText);

            if (result == null || !result.success)
            {
                Console.WriteLine("Job start response was not successful");
                return null;
            }

            return new Job
            {
                Id = result.job_id,
                SourceCity = sourceCity,
                DestinationCity = destCity
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error starting job: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> CompleteJob(string jobId, bool deliveredLate)
    {
        try
        {
            var payload = new
            {
                api_key = apiKey,
                job_id = jobId,
                delivered_late = deliveredLate
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{apiUrl}/api/jobs/complete", content);
            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Failed to complete job: {response.StatusCode} - {responseText}");
                return false;
            }

            var result = JsonConvert.DeserializeObject<JobCompleteResponse>(responseText);
            return result?.success ?? false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error completing job: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendTelemetry(string? jobId, SCSTelemetry data)
    {
        try
        {
            var payload = new
            {
                api_key = apiKey,
                job_id = jobId,
                speed = data.Speed * 2.23694, // m/s to mph
                rpm = data.EngineRpm,
                gear = data.Gear,
                fuel_current = data.FuelAmount * 0.264172, // liters to gallons
                fuel_capacity = data.FuelCapacity * 0.264172,
                engine_damage = data.EngineDamage * 100,
                transmission_damage = data.TransmissionDamage * 100,
                chassis_damage = data.ChassisDamage * 100,
                wheels_damage = data.WheelsDamage * 100,
                cabin_damage = data.CabinDamage * 100,
                cargo_damage = data.CargoDamage * 100,
                position_x = data.PositionX,
                position_y = data.PositionY,
                position_z = data.PositionZ
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{apiUrl}/api/telemetry", content);

            if (!response.IsSuccessStatusCode)
            {
                var responseText = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Failed to send telemetry: {response.StatusCode} - {responseText}");
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending telemetry: {ex.Message}");
            return false;
        }
    }
}
