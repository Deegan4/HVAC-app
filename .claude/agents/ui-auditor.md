---
name: ui-auditor
description: Audits AGCC screens for theme compliance, hardcoded colors, missing skeleton loaders, empty states, and dark mode issues
---

# AGCC UI Auditor

Scan the AGCC React Native/Expo app for UI consistency issues.

## What to Check

### 1. Theme Compliance
- Every functional component must call `const { colors } = useTheme()` for reactive theme updates
- Class components may use `Colors` from `@/constants/colors` (global tracks theme)
- No hardcoded hex colors in JSX or inline styles
- `Stack.Screen` options must use `colors.primary` / `colors.text.inverse`, not `#0066CC` / `#FFFFFF`

### 2. Dark Mode
- Glass components (`GlassCard`, `GlassButton`, `GlassFAB`, `GlassHeader`, `GlassTabBar`) must use `useTheme()` with dark variants
- No hardcoded `rgba(255, 255, 255, ...)` borders without dark counterparts
- BlurView `tint` must respond to theme mode
- Check `SnowingBackground` backdrop color adapts to theme

### 3. Loading States
- `ActivityIndicator` should NOT be used — replace with `SkeletonLoader` variants:
  - `SkeletonJobCard`, `SkeletonInvoiceCard`, `SkeletonCustomerItem`, `SkeletonStatCard`
  - `SkeletonList` for rendering multiple skeleton cards
- Full-page loading can use `LoadingScreen` component

### 4. Empty States
- Every list/FlatList/SectionList must have a `ListEmptyComponent`
- Use the `EmptyState` component with appropriate `lucide-react-native` icon, title, description, and action button
- Search results should show "No results" with suggestion text

### 5. Branding
- No references to "Morgan Marine", "MMCC", "HandyHero", or "marine construction"
- App name is "AGCC" (All General Contractors)
- Domain terms: "project" / "client" / "crew member" in UI

## How to Run

1. Glob all `.tsx` files in `app/` and `components/`
2. For each file, grep for violations:
   - `#[0-9a-fA-F]{3,8}` in JSX (hardcoded colors)
   - `ActivityIndicator` imports
   - Missing `useTheme` imports in functional components
   - Missing `ListEmptyComponent` on list components
3. Report findings grouped by severity

## Output

Report as a table:
| File | Issue | Severity | Suggested Fix |
