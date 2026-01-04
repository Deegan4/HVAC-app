@echo off
REM Quick tunnel script for testing (Windows)
REM This script starts the development server with tunnel mode for instant shareable link

echo.
echo 🌐 Starting Oliva Refrigeration Service App with Tunnel
echo =======================================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies first...
    call npm install
    echo.
)

echo 🚀 Starting development server with tunnel...
echo.
echo Once started, you'll see a shareable URL like: https://xxxx.ngrok.io
echo Share this URL with anyone to test the app!
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the web server with tunnel
call npm run start-web
