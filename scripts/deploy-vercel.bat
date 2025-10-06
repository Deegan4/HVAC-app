@echo off
REM Deployment script for Vercel (Windows)
REM This script helps you quickly deploy the app and get a shareable URL

echo.
echo 🚀 Oliva Refrigeration Service App - Vercel Deployment
echo =======================================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Vercel CLI not found. Installing...
    call npm install -g vercel
) else (
    echo ✅ Vercel CLI is already installed
)

echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env and add your Supabase credentials
    echo    - EXPO_PUBLIC_SUPABASE_URL
    echo    - EXPO_PUBLIC_SUPABASE_ANON_KEY
    echo.
    echo After updating .env, run this script again.
    exit /b 1
)

echo ✅ Environment file found
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Deploying to Vercel...
echo.

REM Deploy to Vercel
call vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo Your app is now live! The shareable URL is shown above.
echo.
echo Next steps:
echo 1. Test the URL in your browser
echo 2. Share with team members for testing
echo 3. Set up custom domain (optional): vercel domains add ^<domain^>
echo.

pause
