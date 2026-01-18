# 🚛 RoadMaster Pro - ATS Telemetry Plugin

Connects American Truck Simulator to your RoadMaster Pro dashboard for real-time tracking and analytics.

## Prerequisites

- **American Truck Simulator** (latest version recommended)
- **.NET 6.0 Runtime** (x64) - [Download here](https://dotnet.microsoft.com/download/dotnet/6.0)
- **RoadMaster Pro Account** with API key

## Quick Start

### 1. Get Your API Key

1. Open your RoadMaster Pro dashboard: http://localhost:3002/dashboard
2. Copy your API key (starts with `rm_`)
   - If you don't see it, check the Settings page or user_preferences table in Supabase

### 2. Build the Plugin

```batch
build.bat
```

This compiles the C# plugin into a DLL that ATS can load.

### 3. Install to ATS

```batch
install.bat
```

This copies the plugin files to your ATS plugins directory:
`%USERPROFILE%\Documents\American Truck Simulator\bin\win_x64\plugins\`

### 4. Configure API Key

1. Open the config file:
   ```
   %USERPROFILE%\Documents\American Truck Simulator\bin\win_x64\plugins\config.json
   ```

2. Edit and replace `rm_YOUR_API_KEY_HERE` with your actual API key:
   ```json
   {
     "apiKey": "rm_your_actual_key_here",
     "apiUrl": "http://localhost:3002"
   }
   ```

3. Save the file

### 5. Launch ATS

1. Start American Truck Simulator
2. The plugin loads automatically when you enter the game
3. Accept a job from the freight market
4. Start driving!

## How It Works

The plugin:
- ✅ Reads game telemetry via SCS SDK (Memory Mapped File)
- ✅ Detects when you start/complete jobs
- ✅ Sends truck data every second (speed, RPM, fuel, damage, position)
- ✅ Calculates profit automatically based on fuel/damage costs
- ✅ Updates your dashboard in real-time

## Verifying It Works

### In ATS Console

When you launch ATS, you should see:
```
🚛 RoadMaster Pro - ATS Telemetry Plugin
==========================================

✅ API configured: http://localhost:3002
✅ Connected to American Truck Simulator

Monitoring telemetry data (1Hz sampling)...
```

When you accept a job:
```
🚛 Job started: Los Angeles → San Francisco
   Cargo: Electronics
   Income: $12,450
   Distance: 382 km
```

When you complete it:
```
✅ Job completed: Los Angeles → San Francisco
   Status: ✓ On Time
   Profit calculated and saved to dashboard
```

### In Dashboard

1. Open http://localhost:3002/dashboard
2. You should see your job appear immediately
3. Performance metrics update in real-time
4. Check http://localhost:3002/live for live telemetry (speed, RPM, fuel)

## Troubleshooting

### "Cannot connect to American Truck Simulator"

**Causes:**
- ATS is not running
- You're in the menu (not in-game)
- SCS SDK is not enabled

**Solutions:**
1. Make sure ATS is running and you're driving
2. Check ATS has SDK enabled (usually enabled by default)

### "API key not configured"

**Solution:**
1. Make sure you edited `config.json` in the plugins folder
2. Verify you replaced `rm_YOUR_API_KEY_HERE` with your actual key
3. Check there are no typos in the API key

### "No data appearing in dashboard"

**Checks:**
1. Verify plugin is running (check ATS console output)
2. Confirm API key is correct in `config.json`
3. Ensure dashboard is running at http://localhost:3002
4. Check browser console for errors (F12)
5. Verify you're logged into the dashboard with the same account

### "DLL not loading" / Plugin doesn't start

**Solutions:**
1. Install .NET 6.0 Runtime (x64): https://dotnet.microsoft.com/download/dotnet/6.0
2. Make sure you built for x64 platform (build.bat does this automatically)
3. Check ATS logs for errors

## Production Deployment

Once you deploy your dashboard to Vercel:

1. Edit `config.json` and update the `apiUrl`:
   ```json
   {
     "apiKey": "your_key_here",
     "apiUrl": "https://your-app.vercel.app"
   }
   ```

2. Restart ATS

The plugin will now send data to your production server instead of localhost.

## Uninstall

To remove the plugin:

1. Delete the files from:
   ```
   %USERPROFILE%\Documents\American Truck Simulator\bin\win_x64\plugins\
   ```

2. Specifically remove:
   - RoadMasterPlugin.dll
   - RoadMasterPlugin.deps.json
   - RoadMasterPlugin.runtimeconfig.json
   - Newtonsoft.Json.dll
   - config.json

## Development

### Building from Source

Requirements:
- .NET 6.0 SDK (not just runtime)
- Visual Studio 2022 or VS Code with C# extension

```batch
cd RoadMasterPlugin
dotnet restore
dotnet build -c Release -p:Platform=x64
```

### Testing Without ATS

You can test the API client without the game by modifying `Plugin.cs` to send mock data.

## Support

- Check logs in ATS console
- Verify dashboard is running: http://localhost:3002
- Review API logs in Supabase dashboard
- Check browser developer console (F12)

## License

Part of RoadMaster Pro - All rights reserved

---

**Built with ❤️ for the ATS community**
