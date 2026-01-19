@echo off
echo.
echo ========================================
echo   RoadMaster Pro - Build Info
echo ========================================
echo.

if not exist "RoadMasterPlugin\bin\Release\net6.0\win-x64\RoadMasterPlugin.exe" (
    echo [!] Plugin EXE not found!
    echo     Please run build.bat first to build the plugin.
    echo.
    pause
    exit /b 1
)

echo [OK] Plugin built successfully!
echo.
echo ========================================
echo   IMPORTANT: This is a STANDALONE app
echo ========================================
echo.
echo The RoadMaster plugin is NOT a game plugin - it runs as a
echo separate console application alongside ATS.
echo.
echo Files are located at:
echo   RoadMasterPlugin\bin\Release\net6.0\win-x64\
echo.
echo BEFORE RUNNING THE PLUGIN:
echo.
echo 1. Install RenCloud SDK in your ATS game folder:
echo    D:\SteamLibrary\steamapps\common\American Truck Simulator\bin\win_x64\plugins\scs-telemetry.dll
echo.
echo    Download from: https://github.com/RenCloud/scs-sdk-plugin/releases
echo.
echo 2. Launch ATS and accept the SDK activation popup
echo.
echo 3. Edit config.json in the build folder:
echo    RoadMasterPlugin\bin\Release\net6.0\win-x64\config.json
echo.
echo 4. Replace "rm_YOUR_API_KEY_HERE" with your API key
echo    Get your API key from http://localhost:3000/settings
echo.
echo 5. Run the plugin:
echo    RoadMasterPlugin\bin\Release\net6.0\win-x64\RoadMasterPlugin.exe
echo.
echo ========================================
pause
