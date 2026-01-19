using System.Text;
using Newtonsoft.Json;
using RoadMasterPlugin.Models;
using SCSSdkClient.Object;

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
            // Get truck position from RenCloud SDK (DPlacement has Position which is DVector)
            var position = data.TruckValues.Positioning.TruckPosition?.Position;

            var payload = new
            {
                api_key = apiKey,
                job_id = jobId,
                // Speed is in kph, convert to mph
                speed = data.TruckValues.CurrentValues.DashboardValues.Speed.Kph * 0.621371,
                rpm = (int)data.TruckValues.CurrentValues.DashboardValues.RPM,
                gear = data.TruckValues.CurrentValues.DashboardValues.GearDashboards,
                // Fuel is in liters, convert to gallons
                fuel_current = data.TruckValues.CurrentValues.DashboardValues.FuelValue.Amount * 0.264172,
                fuel_capacity = data.TruckValues.ConstantsValues.CapacityValues.Fuel * 0.264172,
                // Damage values are 0-1, convert to percentage
                engine_damage = data.TruckValues.CurrentValues.DamageValues.Engine * 100,
                transmission_damage = data.TruckValues.CurrentValues.DamageValues.Transmission * 100,
                chassis_damage = data.TruckValues.CurrentValues.DamageValues.Chassis * 100,
                wheels_damage = data.TruckValues.CurrentValues.DamageValues.WheelsAvg * 100,
                cabin_damage = data.TruckValues.CurrentValues.DamageValues.Cabin * 100,
                cargo_damage = data.JobValues.CargoValues.CargoDamage * 100,
                // Position (DVector has X, Y, Z)
                position_x = position?.X ?? 0,
                position_y = position?.Y ?? 0,
                position_z = position?.Z ?? 0,
                // Enhanced telemetry - Cruise Control
                cruise_control_speed = data.TruckValues.CurrentValues.DashboardValues.CruiseControlSpeed.Kph * 0.621371,
                cruise_control_enabled = data.TruckValues.CurrentValues.DashboardValues.CruiseControl,
                // Brake and Assist Systems
                parking_brake = data.TruckValues.CurrentValues.MotorValues.BrakeValues.ParkingBrake,
                motor_brake = data.TruckValues.CurrentValues.MotorValues.BrakeValues.MotorBrake,
                retarder_level = (int)data.TruckValues.CurrentValues.MotorValues.BrakeValues.RetarderLevel,
                air_pressure = data.TruckValues.CurrentValues.MotorValues.BrakeValues.AirPressure,
                brake_temperature = data.TruckValues.CurrentValues.MotorValues.BrakeValues.Temperature,
                // Navigation and Route Advisor
                navigation_distance = data.NavigationValues.NavigationDistance,
                navigation_time = data.NavigationValues.NavigationTime,
                speed_limit = data.NavigationValues.SpeedLimit.Kph * 0.621371
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
