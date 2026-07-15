@echo off
chcp 65001 >nul
title Aloha Data Map - Launcher

cd /d "%~dp0"

echo Starting Aloha Data Map...
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo.

start "Aloha Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "Aloha Frontend" cmd /k "%~dp0start-frontend.bat"

echo Backend and frontend started in separate windows.
echo Close each window to stop the service.
echo.
pause
