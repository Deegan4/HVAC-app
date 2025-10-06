# Oliva Refrigeration Service App

A comprehensive mobile and web application for managing refrigeration service operations, including customer management, job tracking, invoicing, and technician coordination.

---

## ⚡ Want a Shareable Link Right Now?

**See [`QUICK_START.md`](./QUICK_START.md)** for the fastest way to get a shareable URL!

Or run one of these commands:
- **Quick testing:** `npm run tunnel` (instant shareable link)
- **Permanent URL:** `npm run deploy` (24/7 hosting on Vercel)

For detailed deployment options, see [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

---

## 🚀 Quick Start - Get a Shareable Link

### Option 1: Deploy to Vercel (Recommended for permanent web URL)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Set up environment variables**:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase credentials (see SUPABASE_SETUP.md)

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts, and Vercel will give you a shareable URL like `https://oliva-refrigeration-service-app.vercel.app`

4. **Set environment variables on Vercel**:
   ```bash
   vercel env add EXPO_PUBLIC_SUPABASE_URL
   vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy again** to use the environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Use Tunnel Mode (Quick testing)

For quick testing with a temporary shareable link:

```bash
npm run start-web
```

This will start the development server with tunnel mode enabled and give you a shareable URL like `https://xxx.ngrok.io` that anyone can access.

### Option 3: Mobile Testing with Expo Go

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start with tunnel**:
   ```bash
   npm start
   ```

3. **Scan QR code** with Expo Go app on your mobile device

## 📱 Features

- **Customer Management**: Track customer information, equipment, and service history
- **Job Scheduling**: Schedule and track service jobs with real-time updates
- **Invoicing**: Create and manage invoices with automatic calculations
- **Technician Tracking**: Monitor technician locations and job assignments
- **Messaging**: Built-in communication system for team coordination
- **Calendar Integration**: Manage appointments and events
- **Offline Support**: Work without internet connection with automatic sync
- **Multi-language Support**: Available in multiple languages
- **Secure Authentication**: PIN and biometric authentication options

## 🛠️ Technology Stack

- **Framework**: Expo with React Native
- **Routing**: Expo Router
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **API Layer**: tRPC with Hono
- **State Management**: Zustand
- **Styling**: NativeWind (TailwindCSS for React Native)
- **UI Components**: Custom glass-morphism design system

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd oliva-refrigeration-service-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials

4. **Set up Supabase**:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Run the SQL schema in your Supabase SQL Editor
   - Add your Supabase URL and Anon Key to `.env`

5. **Start the development server**:
   ```bash
   npm start
   ```

## 🌐 Deployment

### Web Deployment (Vercel)

```bash
vercel --prod
```

### Mobile Deployment

For iOS and Android builds, use Expo Application Services (EAS):

```bash
npm install -g eas-cli
eas build --platform all
```

## 📝 Scripts

- `npm start` - Start development server with tunnel
- `npm run start-web` - Start web development server with tunnel
- `npm run start-web-dev` - Start web server with debug mode
- `npm run export:web` - Export web build for deployment
- `npm run lint` - Run ESLint

## 🔒 Security

- Row Level Security (RLS) enabled on all Supabase tables
- User authentication required for all operations
- Data isolated per user account
- Secure environment variable handling

## 📄 License

Private - All rights reserved

