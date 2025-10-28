# PowerShell script to run both frontend and backend concurrently
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd backend && npm start"
Start-Job -Name "Frontend" -ScriptBlock { Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd organflow-hash-care-main && npm run dev" }

Write-Host "Both servers are starting..."
Write-Host "Backend: http://localhost:3002"
Write-Host "Frontend: Will start on first available port (8080+)"

Read-Host "Press Enter to stop all servers"
