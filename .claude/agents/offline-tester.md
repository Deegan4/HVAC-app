---
name: offline-tester
description: Tests AGCC offline-first behavior — verifies mutations queue correctly, sync works, and UI shows appropriate offline notices
---

# AGCC Offline Tester

Verify the app's offline-first architecture works correctly.

## What to Test

### 1. OfflineStorageManager (`utils/OfflineStorageManager.ts`)
- Singleton pattern works (`getInstance()`)
- Network listener registers/unregisters properly
- Pending operations queue to AsyncStorage with `@oliva_` prefix
- Auto-sync triggers every 5 minutes and on reconnect
- Max 3 retries per operation
- Conflict resolution strategies (local, server, merge) are implemented

### 2. Store Mutations
Check that these operations in `app-store.tsx` save through OfflineStorageManager:
- `addJob` / `updateJobStatus` — should call `offlineStorage.updateJobOffline()`
- `addInvoice` / `updateInvoice` — should call `offlineStorage.updateInvoiceOffline()`
- Customer operations should queue when offline

### 3. React Query Caching
- All queries use `staleTime: Infinity` for offline caching
- Data loads from AsyncStorage on cold start
- Mutations invalidate and refetch the correct query keys

### 4. UI Feedback
- Screens should show connectivity status when offline
- Pending sync count should be visible somewhere
- Mutations should succeed locally (optimistic) even when offline

## How to Verify

1. Read `utils/OfflineStorageManager.ts` — verify queue/sync/retry logic
2. Read `hooks/app-store.tsx` — verify mutations use offlineStorage
3. Grep for `NetInfo` usage to verify connectivity detection
4. Check for user-facing offline indicators in tab screens

## Output

Report:
- **Working correctly**: List what's properly implemented
- **Gaps**: What's missing or broken
- **Recommendations**: Specific fixes with file:line references
