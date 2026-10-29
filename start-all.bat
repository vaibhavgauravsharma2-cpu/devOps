@echo off
title MERN Ecommerce Launcher
echo ========================================================
echo       Launching MERN Ecommerce Full Stack Store
echo ========================================================
set PATH=D:\tools\nodejs;D:\tools\git\cmd;D:\tools\mongodb\bin;%PATH%
cd /d "%~dp0"

echo [1/3] Checking MongoDB...
netstat -ano | findstr /R /C:":27017 .*LISTENING" >nul
if errorlevel 1 (
    echo Starting local MongoDB on port 27017...
    start "MongoDB Server" /min "D:\tools\mongodb\bin\mongod.exe" --dbpath "D:\tools\mongodb\data" --bind_ip 127.0.0.1 --port 27017
    timeout /t 3 /nobreak >nul
) else (
    echo MongoDB is already active and listening on port 27017.
)

echo [2/3] Preparing environment...
set NODE_OPTIONS=--openssl-legacy-provider

echo [3/3] Starting backend (:3000) and frontend (:8080)...
echo.
echo Application URLs:
echo   - Frontend: http://localhost:8080
echo   - Backend:  http://localhost:3000
echo   - Admin login: admin@example.com / Admin@123
echo.
npm run dev
pause
