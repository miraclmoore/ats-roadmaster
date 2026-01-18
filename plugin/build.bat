@echo off
echo.
echo ========================================
echo   RoadMaster Pro - Building Plugin
echo ========================================
echo.

cd RoadMasterPlugin

echo Restoring NuGet packages...
dotnet restore

echo.
echo Building Release version (x64)...
dotnet build -c Release -p:Platform=x64

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo ✅ Build complete!
echo ========================================
echo.
echo DLL location:
echo   bin\Release\net6.0\RoadMasterPlugin.dll
echo.
echo Next step: Run install.bat to install to ATS
echo.
pause
