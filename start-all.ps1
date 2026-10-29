# PowerShell Launcher for MERN Ecommerce
$env:PATH = "D:\tools\nodejs;D:\tools\git\cmd;D:\tools\mongodb\bin;" + $env:PATH
$env:NODE_OPTIONS = "--openssl-legacy-provider"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Launching MERN Ecommerce Full Stack Store        " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check if MongoDB is running
$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if (-not $mongoRunning) {
    Write-Host "[1/3] Starting local MongoDB on port 27017..." -ForegroundColor Yellow
    Start-Process -FilePath "D:\tools\mongodb\bin\mongod.exe" -ArgumentList '--dbpath "D:\tools\mongodb\data" --bind_ip 127.0.0.1 --port 27017' -WindowStyle Minimized
    Start-Sleep -Seconds 3
} else {
    Write-Host "[1/3] MongoDB is already active and listening on port 27017." -ForegroundColor Green
}

Write-Host "[2/3] Environment configured." -ForegroundColor Green
Write-Host "[3/3] Starting backend (:3000) and frontend (:8080)..." -ForegroundColor Green
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "  - Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  - Admin login: admin@example.com / Admin@123" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path $PSScriptRoot
npm run dev
