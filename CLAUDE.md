# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AGCC (All General Contractors) — a React Native/Expo mobile app for managing general contracting projects (renovations, new builds, repairs, remodels) in Southwest Florida. Supports project scheduling, client management, invoicing, and offline-first operation.

## Commands

```bash
# Install dependencies (uses bun, falls back to npm with --legacy-peer-deps)
npm install --legacy-peer-deps

# Start dev server with tunnel
npm start
# equivalently: bunx rork start -p zxe41fqs3zralpfajqtq8 --tunnel

# Start web version
npm run start-web

# Lint
npx expo lint

# Start with Cloudflare tunnel (for remote testing)
npx expo start --port 8081 &
cloudflared tunnel --url http://localhost:8081
```

No test runner is configured.

## Architecture

### Routing (Expo Router — file-based)

`app/_layout.tsx` is the root entry point. It gates the app through a sequential auth flow before showing the main tabs:

```
Load → Language Selection → Role Selection → PIN Setup → PIN Auth → Onboarding Tutorial → Main App
```

Each gate checks a boolean from `useAppStore()` (`hasRole`, `hasPin`, `isAuthenticated`, `hasCompletedOnboarding`).

**Tab structure** (`app/(tabs)/`): Home (dashboard), Clients, Invoices, More.
**Modal routes**: `job-details`, `new-job`, `new-customer`, `new-invoice`, `customer-details`, etc.

### State Management (Zustand + React Query)

- **`hooks/app-store.tsx`** — Main Zustand store via `@nkzw/create-context-hook`. Holds all domain data (jobs, customers, invoices, technicians, messages), auth state, and CRUD operations. Data persists to AsyncStorage. React Query wraps data loading with `staleTime: Infinity` for offline caching.
- **`hooks/theme-store.tsx`** — Theme mode (light/dark) persisted to AsyncStorage. Exposes `colors`, `mode`, `toggleTheme()`.
- **`constants/colors.ts`** — Light and dark palettes. A mutable `Colors` export is updated via `updateColors(mode)`. Components access theme colors through `useTheme().colors`.

### Offline-First (`utils/OfflineStorageManager.ts`)

Singleton that uses `@react-native-community/netinfo` to detect connectivity. Queues mutations (job/invoice/customer creates/updates, photo/signature uploads) as `PendingSync` items in AsyncStorage (prefix `@oliva_`). Auto-syncs every 5 minutes or on reconnect. Max 3 retries per operation.

### Role-Based Access

Two roles: `owner` and `technician` (displayed as "Crew Member"). Owners see all features; technicians are restricted by a `TechnicianPermissions` object with 15 boolean flags. The `OwnerAuthGuard` component gates sensitive screens with a secondary password.

### Subscription System

Three tiers: `basic`, `essentials`, `max`. Feature access controlled by flags in `SubscriptionFeatures`. The store exposes `hasFeature(featureName)` to check access.

### Translations (`constants/translations.ts`)

`useTranslation(language)` returns typed string maps. English and Spanish supported. Language stored in app state and persisted via AsyncStorage.

### Analytics (`utils/AnalyticsLogger.ts`)

Singleton structured logger with typed event categories (onboarding, auth, theme, navigation, CRUD, errors). Currently outputs to console; swap `send()` implementation for a real SDK when ready.

## Key Conventions

- **Domain terminology**: "project" (not "job"), "client" (not "customer" in UI), "crew member" (not "technician" in UI). Internal types/variables still use `Job`, `Customer`, `Technician`.
- **Color usage**: Always use `useTheme().colors` in components or `Colors` from constants in class components/StyleSheet — never hardcode color values.
- **Glass UI components**: `GlassCard`, `GlassButton`, `GlassFAB`, `GlassHeader`, `GlassTabBar` provide the frosted-glass design system with dark mode support.
- **Haptics**: Use `HapticFeedback.success()`, `.error()`, `.warning()`, `.medium()` from `utils/HapticFeedback.ts`.
- **Icons**: `lucide-react-native` is the icon library.
- **Loading states**: Use `SkeletonLoader` components, never `ActivityIndicator`.
- **Empty states**: Use the `EmptyState` component with icons and action buttons.
- **Path alias**: `@/` maps to project root (`@/components/`, `@/hooks/`, etc.).

## Tech Stack

- React Native 0.81.5, Expo 54, Expo Router 6 (typed routes)
- Zustand 5 + TanStack React Query 5 + AsyncStorage
- TypeScript 5.9 (strict mode)
- tRPC + Hono (API layer, not yet fully connected — app uses local mock data)
- Supabase SDK (configured but currently using AsyncStorage fallback)

## Mock Data

`mocks/data.ts` provides seed data for development: crew members, clients, general contracting jobs in Cape Coral/Fort Myers/Naples, and invoices with construction materials line items.

## Business Context

All General Contractors & Consulting (AGCC)
- License: CBC1253967
- Service area: Cape Coral, Fort Myers, Naples, Punta Gorda (Lee, Collier, Charlotte Counties)
- Contact: info@agcc.com, 239-722-0762
- Services: Renovations, new builds, repairs, remodels, inspections, permitting
