@echo off
title Seed Database
echo ========================================================
echo Seeding MERN Ecommerce Database with Sample Data...
echo ========================================================
set PATH=D:\tools\nodejs;D:\tools\git\cmd;D:\tools\mongodb\bin;%PATH%
cd /d "%~dp0server"

if "%~1"=="" (
    echo Seeding default admin: admin@example.com / Admin@123
    node utils/seed.js admin@example.com Admin@123
) else (
    echo Seeding with custom credentials: %1 / %2
    node utils/seed.js %1 %2
)

echo.
echo Database seeding complete!
pause
