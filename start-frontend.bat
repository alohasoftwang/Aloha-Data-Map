@echo off
chcp 65001 >nul
title Aloha Data Map - Frontend

cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败。
        pause
        exit /b 1
    )
    echo.
)

echo 正在启动前端 (Vue3 + Vite)...
echo 地址: http://localhost:5173
echo.

call npm run dev

pause
