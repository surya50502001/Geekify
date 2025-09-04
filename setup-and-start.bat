@echo off
echo Setting up Geekify Server...
cd /d "f:\surya50502001\Geekify"

echo Installing server dependencies...
copy server-package.json package.json
npm install

echo Starting server...
node simple-server.js