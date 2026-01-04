#!/bin/bash

# Quick tunnel script for testing
# This script starts the development server with tunnel mode for instant shareable link

set -e

echo "🌐 Starting Oliva Refrigeration Service App with Tunnel"
echo "======================================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
    echo ""
fi

echo "🚀 Starting development server with tunnel..."
echo ""
echo "Once started, you'll see a shareable URL like: https://xxxx.ngrok.io"
echo "Share this URL with anyone to test the app!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the web server with tunnel
npm run start-web
