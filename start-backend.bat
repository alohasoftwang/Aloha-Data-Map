@echo off
chcp 65001 >nul
title Aloha Data Map - Backend

cd /d "%~dp0backend"
echo 正在启动后端 (Spring Boot)...
echo 地址: http://localhost:8080
echo.

mvn spring-boot:run

pause
