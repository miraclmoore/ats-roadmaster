@echo off
echo.
echo ========================================
echo   RoadMaster Pro - Installing Plugin
echo ========================================
echo.

set ATS_PLUGINS=%USERPROFILE%\Documents\American Truck Simulator\bin\win_x64\plugins

if not exist "%ATS_PLUGINS%" (
    echo Creating plugins directory...
    mkdir "%ATS_PLUGINS%"
    echo ✅ Directory created: %ATS_PLUGINS%
    echo.
)

if not exist "RoadMasterPlugin\bin\Release\net6.0\RoadMasterPlugin.dll" (
    echo ❌ Plugin DLL not found!
    echo    Please run build.bat first to build the plugin.
    echo.
    pause
    exit /b 1
)

echo Copying files to ATS plugins folder...
copy /Y "RoadMasterPlugin\bin\Release\net6.0\RoadMasterPlugin.dll" "%ATS_PLUGINS%\"
copy /Y "RoadMasterPlugin\bin\Release\net6.0\RoadMasterPlugin.deps.json" "%ATS_PLUGINS%\"
copy /Y "RoadMasterPlugin\bin\Release\net6.0\RoadMasterPlugin.runtimeconfig.json" "%ATS_PLUGINS%\"
copy /Y "RoadMasterPlugin\bin\Release\net6.0\Newtonsoft.Json.dll" "%ATS_PLUGINS%\"
copy /Y "RoadMasterPlugin\bin\Release\net6.0\config.json" "%ATS_PLUGINS%\"

echo.
echo ========================================
echo ✅ Installation complete!
echo ========================================
echo.
echo Plugin installed to:
echo   %ATS_PLUGINS%
echo.
echo NEXT STEPS:
echo   1. Edit config.json in the plugins folder
echo   2. Replace "rm_YOUR_API_KEY_HERE" with your API key
echo   3. Get your API key from http://localhost:3002/dashboard
echo   4. Launch American Truck Simulator
echo   5. Accept a job and start driving!
echo.
echo Config file location:
echo   %ATS_PLUGINS%\config.json
echo.
pause
