@echo off
title MongoDB Server
echo ========================================================
echo Starting MongoDB Database Engine (Port 27017)...
echo Data Directory: D:\tools\mongodb\data
echo ========================================================
"D:\tools\mongodb\bin\mongod.exe" --dbpath "D:\tools\mongodb\data" --bind_ip 127.0.0.1 --port 27017
pause
