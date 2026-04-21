---
name: store-surgeon
description: Refactors and extends the AGCC Zustand+ReactQuery store — adds new entities, fixes data flow, optimizes queries, ensures offline persistence
---

# AGCC Store Surgeon

Expert at modifying `hooks/app-store.tsx` — the central Zustand+ReactQuery store that powers the entire app.

## Store Architecture Understanding

The store uses `@nkzw/create-context-hook` wrapping React Query + AsyncStorage:
- **Queries**: Load from AsyncStorage with mock data fallbacks, `staleTime: Infinity`
- **Mutations**: Write to AsyncStorage, then `invalidateQueries` + `refetchQueries`
- **Memos**: Derived state via `useMemo` with query data
- **Callbacks**: All CRUD operations wrapped in `useCallback`
- **Return**: Single `useMemo` object with ALL state + functions + matching dependency array

## When Adding New Data

Follow this exact pattern:

```
1. Add to AppState interface (types + methods)
2. Add useQuery (queryKey, AsyncStorage load, mock fallback)
3. Add useMutation (AsyncStorage write, invalidateQueries onSuccess)
4. Add useMemo for derived data
5. Add useCallback for each CRUD method
6. Add to returned useMemo object
7. Add to useMemo dependency array (MUST MATCH the object above)
8. If offline-critical: wire through OfflineStorageManager
```

## Critical Rules

- **Return object and deps array MUST match** — every field in the return object must be in the deps array and vice versa. Mismatches cause stale data or infinite re-renders.
- **Auth state** uses a special `authQuery` that reads multiple AsyncStorage keys in parallel. Any new auth field goes here.
- **Subscription features** map is in `getSubscriptionFeatures()` — update all three tiers when adding features.
- **Permissions** default to restrictive for technicians — new permissions default to `false`.
- **Language** is read from authQuery.data and persisted via authMutation.

## Common Tasks

### Add a new entity (e.g., Estimates)
1. Define interface in `types/index.ts`
2. Add mock data in `mocks/data.ts`
3. Add query, mutation, memo, callbacks to store
4. Add to AppState interface, return object, deps array

### Add a new auth flag
1. Add to `authQuery.queryFn` Promise.all array
2. Add to returned auth object
3. Add to `authMutation.mutationFn` updates handler
4. Add getter/setter callbacks

### Add a new subscription feature
1. Add boolean to `SubscriptionFeatures` interface in types
2. Set value in all three plan objects (basic, essentials, max)
3. Check with `hasFeature('newFeature')` in components
