@echo off
echo Starting Organ Donation System...
echo Backend: http://localhost:3002
echo Frontend: Will start on first available port (8080+)
echo.
echo Press Ctrl+C to stop both servers when done
echo.

REM Start backend in new window
start "Backend Server" cmd /c "cd backend && npm start"

REM Give backend a moment to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend App" cmd /c "cd organflow-hash-care-main && npm run dev"

echo Both servers should be starting...
pause
