# RoadMaster Pro - ATS Telemetry Plugin

Track your American Truck Simulator jobs, profits, and performance in real-time.

## Quick Start (2 Steps!)

### Step 1: Run Setup

Double-click **`Setup.bat`** - it will:
- Find your ATS installation automatically
- Install the required telemetry SDK
- Ask for your API key (get it from http://localhost:3000/settings)
- Create a launcher for easy access

### Step 2: Play!

1. Start **American Truck Simulator**
2. Click **Yes** on the SDK activation popup (first time only)
3. Load your save and enter the game world
4. Run **`Launch RoadMaster.bat`** (created by setup)
5. View your dashboard at http://localhost:3000

That's it! The plugin will track your jobs automatically.

---

## What Gets Tracked

- **Jobs**: Routes, cargo, income, distance
- **Live Telemetry**: Speed, RPM, fuel level
- **Performance**: Fuel consumption, damage, delivery times
- **Profits**: Automatic calculation of expenses and profit per mile

## Console Output

When running, you'll see:

```
RoadMaster Pro - ATS Telemetry Plugin
==========================================

[OK] API configured: http://localhost:3000
[OK] Connected to RenCloud SDK telemetry

Monitoring telemetry data...
```

When you accept a job:
```
[JOB] Started: Los Angeles -> San Francisco
      Cargo: Electronics
      Income: $12,450
      Distance: 382 km
```

When you complete it:
```
[OK] Job completed: Los Angeles -> San Francisco
     Profit calculated and saved to dashboard
```

## Troubleshooting

### "Cannot connect to ATS"
- Make sure ATS is running
- Make sure you clicked "Yes" on the SDK popup when ATS started
- Try restarting both ATS and the plugin

### No SDK popup appeared when starting ATS
- Run `Setup.bat` again to reinstall the SDK
- Check that `scs-telemetry.dll` exists in your ATS plugins folder:
  `[Steam]\steamapps\common\American Truck Simulator\bin\win_x64\plugins\`

### "Waiting for game data"
- This is normal when at the main menu
- Load a save and enter the game world to start tracking

### Dashboard not showing data
- Check that the API key in `config.json` matches your dashboard
- Make sure the dashboard is running at http://localhost:3000

## Manual Installation

If Setup.bat doesn't work, you can install manually:

1. Copy `scs-telemetry.dll` to your ATS plugins folder:
   ```
   [Your ATS folder]\bin\win_x64\plugins\scs-telemetry.dll
   ```

2. Run `build.bat` to compile the plugin

3. Edit `RoadMasterPlugin\bin\Release\net6.0\win-x64\config.json`:
   ```json
   {
     "apiKey": "your-api-key-here",
     "apiUrl": "http://localhost:3000"
   }
   ```

4. Run `RoadMasterPlugin\bin\Release\net6.0\win-x64\RoadMasterPlugin.exe`

## Requirements

- Windows 10/11 (64-bit)
- .NET 6.0 Runtime - [Download](https://dotnet.microsoft.com/download/dotnet/6.0)
- American Truck Simulator (Steam version)

## How It Works

```
ATS Game + RenCloud SDK
         |
         v (shared memory)
   RoadMasterPlugin.exe
         |
         v (HTTP)
   Dashboard (localhost:3000)
```

The plugin reads telemetry from ATS via the RenCloud SDK's memory-mapped file, then sends it to your dashboard API.

## License

Part of RoadMaster Pro
