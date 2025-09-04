@echo off
echo Starting Geekify Server...
cd /d "f:\surya50502001\Geekify"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
if not exist "package.json" (
    copy server-package.json package.json
)

if not exist "node_modules" (
    npm install
)

echo Starting server on port 3001...
echo Server will be available at http://localhost:3001
echo Press Ctrl+C to stop the server
node simple-server.js