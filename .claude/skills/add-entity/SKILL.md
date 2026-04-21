---
name: add-entity
description: Add a complete new data entity to AGCC — type definition, mock data, store query/mutation/callbacks, translations, and CRUD screen
---

# Add Entity

Scaffold a complete new data entity end-to-end.

## Usage

User provides:
- **Entity name** (e.g., "Estimate", "TimeEntry", "Material")
- **Fields** — what data it holds
- **Relationships** — which existing entities it connects to

## Steps (MUST follow this order)

### 1. Type Definition (`types/index.ts`)
```typescript
export interface {EntityName} {
  id: string;
  // ... user-specified fields
  createdAt: string;
}
```

### 2. Mock Data (`mocks/data.ts`)
- Add 3-5 realistic mock items for the Cape Coral/Fort Myers area
- Export as `mock{EntityName}s`
- Use consistent ID format: `{entity}{timestamp}`

### 3. Store Integration (`hooks/app-store.tsx`)
Follow the exact store pattern — this is critical:

```
a. Add to AppState interface:
   - {entities}: {EntityName}[]
   - add{EntityName}: (item: Omit<{EntityName}, 'id'>) => void
   - update{EntityName}: (id: string, updates: Partial<{EntityName}>) => void
   - delete{EntityName}: (id: string) => void
   - get{EntityName}ById: (id: string) => {EntityName} | undefined

b. Add useQuery:
   queryKey: ['{entities}']
   queryFn: AsyncStorage.getItem('{entities}') → parse or mock fallback
   staleTime: Infinity

c. Add useMutation:
   mutationFn: AsyncStorage.setItem('{entities}', JSON.stringify(new{Entities}))
   onSuccess: invalidateQueries({ queryKey: ['{entities}'] })

d. Add useMemo:
   const {entities} = useMemo(() => {entities}Query.data ?? mock{Entities}, [{entities}Query.data])

e. Add useCallbacks for each CRUD method

f. Add to isLoading check

g. Add ALL new fields to:
   - The return useMemo object
   - The useMemo dependency array
   ⚠️ THESE MUST MATCH — every item in the object must be in deps and vice versa
```

### 4. Translations (`constants/translations.ts`)
Add to both `en` and `es`:
- `all{Entities}`, `add{EntityName}`, `no{Entities}`, `no{Entities}Description`
- `delete{EntityName}`, `delete{EntityName}Confirm`
- `search{Entities}`

### 5. List Screen (`app/{entities}.tsx`)
- Full CRUD list with search, filter, pull-to-refresh
- `SkeletonLoader` for loading, `EmptyState` for empty
- `useTheme().colors` for all styling
- Haptic feedback on actions
- Permission/subscription gating if needed

### 6. Navigation
- Add to `app/_layout.tsx` Stack if modal
- Add menu item to `more.tsx` if it belongs in settings
- Or add as a tab if it's a primary entity

### 7. Wire to OfflineStorageManager (if needed)
- Add offline mutation methods
- Queue creates/updates when offline
