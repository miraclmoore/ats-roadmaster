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
        SdkActive = 0;
        Paused = 0;
        Speed = 0;
        EngineRpm = 0;
        Gear = 0;
        FuelAmount = 0;
        FuelCapacity = 0;
        EngineDamage = 0;
        TransmissionDamage = 0;
        ChassisDamage = 0;
        WheelsDamage = 0;
        CabinDamage = 0;
        CargoDamage = 0;
        PositionX = 0;
        PositionY = 0;
        PositionZ = 0;
        JobIncome = 0;
        JobDistance = 0;
        JobDeliveredLate = 0;
        SourceCity = new byte[64];
        DestinationCity = new byte[64];
        CargoName = new byte[64];
    }
}
