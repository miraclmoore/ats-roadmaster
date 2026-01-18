using System.IO.MemoryMappedFiles;
using RoadMasterPlugin.Models;

namespace RoadMasterPlugin;

public class TelemetryReader
{
    private const string MMF_NAME = "Local\\SCSTelemetry";
    private MemoryMappedFile? mmf;
    private MemoryMappedViewAccessor? accessor;

    public bool Initialize()
    {
        try
        {
            mmf = MemoryMappedFile.OpenExisting(MMF_NAME);
            accessor = mmf.CreateViewAccessor();
            return true;
        }
        catch (FileNotFoundException)
        {
            Console.WriteLine("Memory Mapped File not found. Make sure ATS is running and the SDK is enabled.");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing telemetry reader: {ex.Message}");
            return false;
        }
    }

    public SCSTelemetry? ReadTelemetry()
    {
        if (accessor == null)
            return null;

        try
        {
            SCSTelemetry data = new SCSTelemetry();
            accessor.Read(0, out data);
            return data;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading telemetry: {ex.Message}");
            return null;
        }
    }

    public void Dispose()
    {
        accessor?.Dispose();
        mmf?.Dispose();
    }
}
