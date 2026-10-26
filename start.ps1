# The IMovies Platform Launcher
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "      🎬 Starting The IMovies Platform Services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Yellow

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend
Write-Host "`n[1/2] Starting Express & MongoDB API on Port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; node server.js"

Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/2] Starting React Vite Frontend on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\frontend'; npm run dev"

Write-Host "`nAll services have been launched!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔌 Backend:  http://localhost:5000/api" -ForegroundColor Yellow
Write-Host "👤 Demo Admin: admin@imovies.com / admin123" -ForegroundColor Gray
Write-Host "👤 Demo User:  john@example.com / password123" -ForegroundColor Gray
