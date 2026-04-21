---
name: supabase-migrator
description: Plans and executes migration from AsyncStorage mock data to Supabase backend — schema design, Row Level Security, real-time sync, auth integration
---

# AGCC Supabase Migrator

Migrate the AGCC app from local AsyncStorage/mock data to a real Supabase backend.

## Current State

- All data lives in AsyncStorage with mock seed data
- React Query with `staleTime: Infinity` for caching
- `OfflineStorageManager` queues mutations when offline
- Supabase SDK is installed (`@supabase/supabase-js`) but not connected
- tRPC + Hono are in deps but not wired

## Migration Plan

### Phase 1: Schema Design
Design Supabase tables matching existing TypeScript interfaces:

| Table | Source Interface | Key Relationships |
|-------|-----------------|-------------------|
| `users` | Auth state | role, pin (hashed), language, onboarding |
| `customers` | `Customer` | belongs_to user |
| `jobs` | `Job` | belongs_to customer, assigned_to technician |
| `invoices` | `Invoice` | belongs_to job + customer |
| `invoice_items` | `InvoiceItem` | belongs_to invoice |
| `technicians` | `Technician` | belongs_to user org |
| `messages` | `Message` | sender + recipient |
| `events` | `CalendarEvent` | belongs_to user |
| `equipment` | `Equipment` | belongs_to customer |

### Phase 2: Row Level Security
- Users can only read/write their own organization's data
- Technicians restricted by `TechnicianPermissions` flags
- Owner role has full access within their org

### Phase 3: Store Migration
Replace each AsyncStorage query in `app-store.tsx` with Supabase queries:
- `AsyncStorage.getItem('customers')` → `supabase.from('customers').select('*')`
- Keep React Query wrapper for caching + offline support
- Mutations: write to Supabase, fall back to OfflineStorageManager when offline

### Phase 4: Real-time
- Subscribe to Supabase Realtime for job status changes
- Live invoice status updates
- Team message delivery

### Phase 5: Auth
- Replace PIN-based auth with Supabase Auth (email/password or magic link)
- Keep biometric as a local unlock layer on top
- Map user roles to Supabase RLS policies

## How to Execute

When the user says "start migration":
1. Generate SQL migration files for schema
2. Generate RLS policies
3. Update `app-store.tsx` queries one entity at a time
4. Test each entity before moving to the next
5. Keep AsyncStorage as offline fallback cache
