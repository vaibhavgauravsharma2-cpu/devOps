@echo off
title Push Commits to GitHub
echo ========================================================
echo Pushing commits to https://github.com/vaibhavgauravsharma2-cpu/devOps.git
echo ========================================================
set PATH=D:\tools\nodejs;D:\tools\git\cmd;%PATH%
cd /d "%~dp0"

echo Running: git push -u origin main
echo (If prompted, log in with your GitHub account credentials or Personal Access Token)
echo.
git push -u origin main

echo.
echo Push process finished.
pause
