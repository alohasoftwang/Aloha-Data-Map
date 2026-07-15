@echo off
chcp 65001 >nul
title Aloha Data Map - Frontend

cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo First run: installing dependencies...
    call npm install
    if errorlevel 1 (
        echo npm install failed.
        pause
        exit /b 1
    )
    echo.
)

echo Starting frontend (Vue3 + Vite)...
echo URL: http://localhost:5173
echo.

call npm run dev

pause
