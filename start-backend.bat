@echo off
chcp 65001 >nul
title Aloha Data Map - Backend

cd /d "%~dp0backend"
echo Starting backend (Spring Boot)...
echo URL: http://localhost:8080
echo.

mvn spring-boot:run

pause
