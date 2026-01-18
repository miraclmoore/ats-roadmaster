using System.Runtime.InteropServices;

namespace RoadMasterPlugin.Models;

[StructLayout(LayoutKind.Sequential)]
public struct SCSTelemetry
{
    // Game state
    public byte SdkActive;
    public byte Paused;

    // Truck data
    public float Speed;              // m/s
    public int EngineRpm;
    public int Gear;
    public float FuelAmount;         // liters
    public float FuelCapacity;       // liters

    // Damage (0.0 to 1.0)
    public float EngineDamage;
    public float TransmissionDamage;
    public float ChassisDamage;
    public float WheelsDamage;
    public float CabinDamage;
    public float CargoDamage;

    // Position
    public double PositionX;
    public double PositionY;
    public double PositionZ;

    // Job info
    public int JobIncome;            // Job pay in game currency
    public int JobDistance;          // km
    public byte JobDeliveredLate;    // 1 if late, 0 if on time

    // Locations (fixed-size char arrays - 64 bytes each)
    [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64)]
    public byte[] SourceCity;

    [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64)]
    public byte[] DestinationCity;

    [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64)]
    public byte[] CargoName;

    public SCSTelemetry()
    {
        SourceCity = new byte[64];
        DestinationCity = new byte[64];
        CargoName = new byte[64];
    }
}
