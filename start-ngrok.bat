@echo off
echo Starting Spotify servers for ngrok...

start "Backend" cmd /k "cd /d e:\Surya\Spotify\Spotify\Spotify.Server && dotnet run"
timeout /t 5
start "Frontend" cmd /k "cd /d e:\Surya\Spotify\Spotify\spotify.client && npm run dev"
timeout /t 5
start "Ngrok Backend" cmd /k "ngrok http 7051"
start "Ngrok Frontend" cmd /k "ngrok http 49794"

echo All services started!
pause