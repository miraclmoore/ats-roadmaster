# RoadMaster Pro - ATS Telemetry Plugin

Connects American Truck Simulator to your RoadMaster Pro dashboard for real-time tracking and analytics.

## Prerequisites

### 1. RenCloud SCS Telemetry SDK (REQUIRED)

This plugin reads telemetry data from the RenCloud SDK. You MUST install it first:

1. Download the latest release from: https://github.com/RenCloud/scs-sdk-plugin/releases
2. Extract `scs-telemetry.dll`
3. Copy it to your ATS game plugins folder:
   ```
   [Steam Library]\steamapps\common\American Truck Simulator\bin\win_x64\plugins\
   ```
   Example: `D:\SteamLibrary\steamapps\common\American Truck Simulator\bin\win_x64\plugins\scs-telemetry.dll`

4. Create the `plugins` folder if it doesn't exist
5. Launch ATS - you should see an **SDK activation popup** - click **Yes**

**If you don't see the popup, the SDK is not installed correctly.**

### 2. .NET 6.0 Runtime (x64)

Download from: https://dotnet.microsoft.com/download/dotnet/6.0

### 3. RoadMaster Pro Account with API Key

Get your API key from the dashboard settings page.

## Quick Start

### 1. Build the Plugin

```batch
build.bat
```

This compiles the C# application. The executable will be at:
`RoadMasterPlugin\bin\Release\net6.0\win-x64\RoadMasterPlugin.exe`

### 2. Configure API Key

Edit the config file in the build folder:
```
RoadMasterPlugin\bin\Release\net6.0\win-x64\config.json
```

Replace `rm_YOUR_API_KEY_HERE` with your actual API key:
```json
{
  "apiKey": "rm_your_actual_key_here",
  "apiUrl": "http://localhost:3000"
}
```

### 3. Run the Plugin

1. Start American Truck Simulator
2. Make sure you accepted the SDK activation popup
3. Enter the game world (not just the menu)
4. Run the plugin:
   ```
   RoadMasterPlugin\bin\Release\net6.0\win-x64\RoadMasterPlugin.exe
   ```
5. Accept a job and start driving!

## How It Works

The plugin is a **standalone console application** that runs alongside ATS:

```
ATS Game
    |
    v (RenCloud SDK creates shared memory)
"Local\SCSTelemetry" Memory Mapped File
    ^
    | (Plugin reads shared memory)
RoadMasterPlugin.exe (this app)
    |
    v (HTTP POST)
Your Dashboard API (localhost:3000)
```

Features:
- Reads game telemetry via RenCloud SDK (Memory Mapped File)
- Detects job start/complete events automatically
- Sends truck data in real-time (speed, RPM, fuel, damage, position)
- Dashboard calculates profit based on fuel/damage costs

## Console Output

When running correctly, you'll see:

```
RoadMaster Pro - ATS Telemetry Plugin
==========================================

[OK] API configured: http://localhost:3000
[...] Connecting to ATS via RenCloud SDK...
[OK] Connected to RenCloud SDK telemetry

Monitoring telemetry data...

Waiting for game data (enter the game world to start receiving data)...

Press any key to stop the plugin...
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

### "Cannot connect to American Truck Simulator"

**Cause:** RenCloud SDK is not installed or not working.

**Solutions:**
1. Verify `scs-telemetry.dll` is in the correct folder:
   `[Steam]\steamapps\common\American Truck Simulator\bin\win_x64\plugins\`
2. Launch ATS - you MUST see the SDK activation popup and click Yes
3. Check the ATS game.log.txt for plugin loading errors

### No SDK Activation Popup

**Cause:** The DLL is in the wrong folder.

**Solutions:**
1. Make sure the DLL is in the **game's own folder**, NOT in Documents
2. The folder structure should be:
   ```
   American Truck Simulator\
     bin\
       win_x64\
         plugins\
           scs-telemetry.dll   <-- HERE
   ```

### "API key not configured"

**Solution:**
1. Edit `config.json` in the build output folder
2. Replace `rm_YOUR_API_KEY_HERE` with your actual key
3. Get your API key from http://localhost:3000/settings

### Plugin connects but no data appears

**Checks:**
1. Are you in the game world (not menu)?
2. Is the dashboard running at localhost:3000?
3. Is your API key correct?
4. Check the plugin console for error messages

## Production Deployment

Once you deploy your dashboard:

1. Edit `config.json` and update the `apiUrl`:
   ```json
   {
     "apiKey": "your_key_here",
     "apiUrl": "https://your-app.vercel.app"
   }
   ```

2. Run the plugin again

## Development

### Building from Source

Requirements:
- .NET 6.0 SDK
- Visual Studio 2022 or VS Code with C# extension

```batch
cd RoadMasterPlugin
dotnet restore
dotnet build -c Release
```

### Project Structure

```
plugin/
  RoadMasterPlugin/
    Plugin.cs           - Main entry point, event handling
    ApiClient.cs        - HTTP communication with dashboard
    Models/             - Data models (Job, Config, API responses)
    SCSSdkClient/       - RenCloud SDK C# client library
      Object/           - Telemetry data structures
    config.json         - API configuration
```

## License

Part of RoadMaster Pro - All rights reserved
