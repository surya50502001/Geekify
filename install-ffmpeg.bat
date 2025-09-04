@echo off
echo Installing FFmpeg for audio conversion...

:: Check if chocolatey is installed
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
)

:: Install FFmpeg
echo Installing FFmpeg...
choco install ffmpeg -y

echo FFmpeg installation complete!
echo Restart your server: node simple-server.js
pause