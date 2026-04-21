---
name: performance-analyzer
description: Analyzes AGCC app for React Native performance issues — unnecessary re-renders, missing memoization, large lists without virtualization, heavy computations in render
---

# AGCC Performance Analyzer

Deep-scan the AGCC React Native app for performance bottlenecks.

## Analysis Targets

### 1. Re-render Prevention
- Components reading from `useAppStore()` should destructure only needed fields (not the entire store)
- Expensive derived data should use `useMemo` with correct dependency arrays
- Callbacks passed as props should use `useCallback`
- Child components receiving object/array props should be wrapped in `React.memo` if they don't need every parent re-render

### 2. List Virtualization
- Any list > 20 items must use `FlatList` or `SectionList`, not `ScrollView` with `.map()`
- `FlatList` must have `keyExtractor` returning stable string keys
- Large lists should use `getItemLayout` for constant-size rows
- `removeClippedSubviews={true}` for lists > 50 items on Android

### 3. Heavy Render Computations
- `useMemo` for: filtering/sorting arrays, date formatting, computed statistics
- No `new Date()`, `JSON.parse()`, or `.filter().map().sort()` chains directly in render
- Image components should use `expo-image` with caching, not raw `<Image>`

### 4. AsyncStorage Efficiency
- Batch reads with `multiGet` instead of sequential `getItem` calls
- Don't read entire collections when you only need one item
- Large datasets should be paginated, not loaded entirely into memory

### 5. Animation Performance
- Animations must use `useNativeDriver: true` where possible
- Don't animate layout properties (width, height, padding) — use transform instead
- `Animated.Value` refs should be created with `useRef`, not `useState`

### 6. Bundle Size
- Check for unused imports (especially large libraries)
- Verify tree-shaking works for icon imports (`import { X } from 'lucide-react-native'` not `import * as Icons`)
- Look for duplicate functionality between dependencies

## How to Run

1. Read `hooks/app-store.tsx` — check store selector patterns
2. Glob `app/**/*.tsx` — check each screen for the patterns above
3. Read `components/*.tsx` — check for missing memoization
4. Grep for anti-patterns: `ScrollView.*\.map`, `new Date()` in render bodies, `JSON.parse` in render

## Output

Rate each area GREEN/YELLOW/RED with specific file:line references and fix recommendations.
