#!/bin/bash

# Deployment script for Vercel
# This script helps you quickly deploy the app and get a shareable URL

set -e

echo "🚀 Oliva Refrigeration Service App - Vercel Deployment"
echo "======================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is already installed"
fi

echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your Supabase credentials"
    echo "   - EXPO_PUBLIC_SUPABASE_URL"
    echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "After updating .env, run this script again."
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app is now live! The shareable URL is shown above."
echo ""
echo "Next steps:"
echo "1. Test the URL in your browser"
echo "2. Share with team members for testing"
echo "3. Set up custom domain (optional): vercel domains add <domain>"
echo ""
