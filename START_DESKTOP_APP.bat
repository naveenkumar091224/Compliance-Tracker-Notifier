@echo off
echo ========================================
echo Compliance Tracker Desktop Application
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    echo.
    pause
    exit /b 1
)

echo Starting backend server with Docker...
cd /d "%~dp0"
docker-compose up -d backend

echo.
echo Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo Checking backend status...
curl -s http://localhost:8000/ >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend may not be ready yet.
    echo Waiting additional 5 seconds...
    timeout /t 5 /nobreak >nul
)

echo.
echo ========================================
echo Backend is running at: http://localhost:8000
echo ========================================
echo.
echo Starting Desktop Application...
echo.

REM Start the desktop app
if exist "dist-electron\win-unpacked\Compliance Tracker.exe" (
    start "" "dist-electron\win-unpacked\Compliance Tracker.exe"
    echo.
    echo Desktop app launched!
    echo.
    echo Login with:
    echo   Username: aarav
    echo   Password: Password123
    echo.
) else (
    echo ERROR: Desktop app not found!
    echo Please build it first with: npm run build:win
    echo.
    pause
    exit /b 1
)

echo.
echo To stop the backend later, run: docker-compose down
echo.
pause

@REM Made with Bob
