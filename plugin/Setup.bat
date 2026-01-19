@echo off
setlocal EnableDelayedExpansion

title RoadMaster Pro - Easy Setup
color 0A

echo.
echo  ========================================
echo   RoadMaster Pro - Easy Setup
echo  ========================================
echo.

:: Check for admin rights (needed for some Steam locations)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo  [!] Tip: Run as Administrator if setup fails
    echo.
)

:: Step 1: Find ATS installation
echo  [1/4] Looking for American Truck Simulator...
echo.

set "ATS_PATH="

:: Check common Steam library locations
for %%D in (C D E F G) do (
    if exist "%%D:\SteamLibrary\steamapps\common\American Truck Simulator\bin\win_x64\amtrucks.exe" (
        set "ATS_PATH=%%D:\SteamLibrary\steamapps\common\American Truck Simulator"
    )
    if exist "%%D:\Steam\steamapps\common\American Truck Simulator\bin\win_x64\amtrucks.exe" (
        set "ATS_PATH=%%D:\Steam\steamapps\common\American Truck Simulator"
    )
)

:: Check Program Files
if not defined ATS_PATH (
    if exist "C:\Program Files (x86)\Steam\steamapps\common\American Truck Simulator\bin\win_x64\amtrucks.exe" (
        set "ATS_PATH=C:\Program Files (x86)\Steam\steamapps\common\American Truck Simulator"
    )
)
if not defined ATS_PATH (
    if exist "C:\Program Files\Steam\steamapps\common\American Truck Simulator\bin\win_x64\amtrucks.exe" (
        set "ATS_PATH=C:\Program Files\Steam\steamapps\common\American Truck Simulator"
    )
)

if not defined ATS_PATH (
    echo  [!] Could not find ATS automatically.
    echo.
    set /p "ATS_PATH=  Enter your ATS folder path: "
)

if not exist "!ATS_PATH!\bin\win_x64\amtrucks.exe" (
    echo.
    echo  [ERROR] Invalid ATS path: !ATS_PATH!
    echo  Could not find amtrucks.exe
    echo.
    pause
    exit /b 1
)

echo  [OK] Found ATS at: !ATS_PATH!
echo.

:: Step 2: Install RenCloud SDK
echo  [2/4] Installing telemetry SDK...
echo.

set "PLUGINS_PATH=!ATS_PATH!\bin\win_x64\plugins"
set "SDK_SOURCE=%~dp0RoadMasterPlugin\SCSSdkClient\scs-telemetry.dll"
set "SDK_BUNDLED=%~dp0scs-telemetry.dll"

:: Create plugins folder if needed
if not exist "!PLUGINS_PATH!" (
    mkdir "!PLUGINS_PATH!"
    echo  [OK] Created plugins folder
)

:: Check if we have the SDK bundled
if exist "!SDK_BUNDLED!" (
    copy /Y "!SDK_BUNDLED!" "!PLUGINS_PATH!\scs-telemetry.dll" >nul
    echo  [OK] Installed scs-telemetry.dll
) else if exist "!SDK_SOURCE!" (
    copy /Y "!SDK_SOURCE!" "!PLUGINS_PATH!\scs-telemetry.dll" >nul
    echo  [OK] Installed scs-telemetry.dll
) else (
    :: Check if already installed
    if exist "!PLUGINS_PATH!\scs-telemetry.dll" (
        echo  [OK] SDK already installed
    ) else (
        echo  [!] scs-telemetry.dll not found in package
        echo.
        echo  Please download it manually from:
        echo  https://github.com/RenCloud/scs-sdk-plugin/releases
        echo.
        echo  And copy scs-telemetry.dll to:
        echo  !PLUGINS_PATH!
        echo.
        pause
    )
)

:: Step 3: Configure API Key
echo.
echo  [3/4] Configuring API key...
echo.

set "CONFIG_PATH=%~dp0RoadMasterPlugin\bin\Release\net6.0\win-x64\config.json"
set "EXE_PATH=%~dp0RoadMasterPlugin\bin\Release\net6.0\win-x64\RoadMasterPlugin.exe"

if not exist "!EXE_PATH!" (
    echo  [!] Plugin not built yet. Building now...
    cd /d "%~dp0"
    call build.bat
    echo.
)

:: Check current config
set "NEEDS_KEY=0"
if exist "!CONFIG_PATH!" (
    findstr /C:"YOUR_API_KEY_HERE" "!CONFIG_PATH!" >nul 2>&1
    if !errorLevel! equ 0 set "NEEDS_KEY=1"
) else (
    set "NEEDS_KEY=1"
)

if "!NEEDS_KEY!"=="1" (
    echo  Your API key is needed to connect to the dashboard.
    echo  Get it from: http://localhost:3000/settings
    echo.
    set /p "API_KEY=  Enter your API key: "

    if defined API_KEY (
        :: Write config file
        echo { > "!CONFIG_PATH!"
        echo   "apiKey": "!API_KEY!", >> "!CONFIG_PATH!"
        echo   "apiUrl": "http://localhost:3000" >> "!CONFIG_PATH!"
        echo } >> "!CONFIG_PATH!"
        echo  [OK] API key saved
    )
) else (
    echo  [OK] API key already configured
)

:: Step 4: Create shortcuts
echo.
echo  [4/4] Creating shortcuts...
echo.

set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\RoadMaster Pro.lnk"

:: Create a simple launcher script
set "LAUNCHER=%~dp0RoadMasterPlugin\bin\Release\net6.0\win-x64\Launch RoadMaster.bat"
echo @echo off > "!LAUNCHER!"
echo title RoadMaster Pro >> "!LAUNCHER!"
echo cd /d "%%~dp0" >> "!LAUNCHER!"
echo RoadMasterPlugin.exe >> "!LAUNCHER!"
echo pause >> "!LAUNCHER!"

echo  [OK] Created launcher: Launch RoadMaster.bat
echo.
echo  ========================================
echo   Setup Complete!
echo  ========================================
echo.
echo  TO USE ROADMASTER PRO:
echo.
echo  1. Start American Truck Simulator
echo  2. Click "Yes" on the SDK popup (first time only)
echo  3. Load your save and enter the game world
echo  4. Run: Launch RoadMaster.bat
echo  5. View your data at: http://localhost:3000
echo.
echo  Plugin location:
echo  %~dp0RoadMasterPlugin\bin\Release\net6.0\win-x64\
echo.
echo  ========================================
echo.

:: Ask to open the folder
set /p "OPEN_FOLDER=  Open plugin folder? (Y/N): "
if /i "!OPEN_FOLDER!"=="Y" (
    explorer "%~dp0RoadMasterPlugin\bin\Release\net6.0\win-x64"
)

echo.
pause
