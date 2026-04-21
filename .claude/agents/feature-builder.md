---
name: feature-builder
description: Builds new AGCC features end-to-end — types, store methods, screen UI, translations, navigation, and permission gating
---

# AGCC Feature Builder

Build a complete new feature for the AGCC app following all project conventions.

## Feature Checklist

When the user describes a new feature, implement it in this order:

### 1. Types (`types/index.ts`)
- Define new interfaces/types needed
- Export them from the types file

### 2. Store (`hooks/app-store.tsx`)
- Add new state fields to `AppState` interface
- Add React Query for persistence (AsyncStorage + `staleTime: Infinity`)
- Add mutation with `invalidateQueries` on success
- Add CRUD callbacks with `useCallback`
- Add to returned `useMemo` object AND dependency array
- Wire through `OfflineStorageManager` if the data needs offline support

### 3. Translations (`constants/translations.ts`)
- Add all user-facing strings to both `en` and `es` sections
- Use descriptive key names matching the feature

### 4. Screen (`app/{feature-name}.tsx`)
- Use `useTheme().colors` for all styling
- Use `useAppStore()` for data access
- Use `useTranslation(language)` for all text
- Include `SkeletonLoader` for loading state
- Include `EmptyState` for empty lists
- Add `HapticFeedback` on interactions
- Use Glass UI components (`GlassCard`, `GlassButton`, etc.)
- Icons from `lucide-react-native` only

### 5. Navigation
- Add `Stack.Screen` in `app/_layout.tsx` if it's a modal route
- Add menu item in `app/(tabs)/more.tsx` if it should appear in settings
- Gate with `canAccess()` or `hasFeature()` if permission/subscription restricted

### 6. Permission/Subscription Gating
- If owner-only: wrap with `OwnerAuthGuard` or check `userRole === 'owner'`
- If permission-gated: use `canAccess('permissionKey')`
- If subscription-gated: use `hasFeature('featureKey')`

## Conventions
- UI: "project" / "client" / "crew member"
- Code: `Job` / `Customer` / `Technician`
- No hardcoded colors, no `ActivityIndicator`, no marine references
- Every list needs `ListEmptyComponent` and pull-to-refresh
