@echo off
chcp 65001 >nul
title Aloha Data Map - Launcher

cd /d "%~dp0"

echo 正在启动 Aloha Data Map...
echo.
echo   后端: http://localhost:8080
echo   前端: http://localhost:5173
echo.

start "Aloha Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "Aloha Frontend" cmd /k "%~dp0start-frontend.bat"

echo 已在两个新窗口中启动后端和前端。
echo 关闭对应窗口即可停止服务。
echo.
pause
