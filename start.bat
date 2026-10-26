@echo off
title The IMovies Platform Launcher
echo ========================================================
echo       🎬 Launching The IMovies Platform
echo ========================================================
echo.

cd /d "%~dp0backend"
echo [1/2] Starting Backend Server (Port 5000)...
start "The IMovies Backend (Port 5000)" cmd /k "node server.js"

timeout /t 2 /nobreak >nul

cd /d "%~dp0frontend"
echo [2/2] Starting Frontend Vite Dev Server (Port 5173)...
start "The IMovies Frontend (Port 5173)" cmd /k "npm run dev"

echo.
echo ========================================================
echo  All services started!
echo  Frontend UI:  http://localhost:5173
echo  Backend APIs: http://localhost:5000/api
echo ========================================================
echo.
pause
