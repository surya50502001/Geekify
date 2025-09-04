@echo off
echo Starting Geekify Server...
cd /d "f:\surya50502001\Geekify"

echo Installing dependencies if needed...
if not exist "package.json" (
    copy server-package.json package.json
)

if not exist "node_modules" (
    npm install
)

echo Starting server on port 3001...
node simple-server.js