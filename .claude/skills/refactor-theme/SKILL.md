---
name: refactor-theme
description: Convert an AGCC screen from hardcoded Colors/hex values to reactive useTheme() with full dark mode support
---

# Refactor Screen to Theme System

Convert a screen that uses hardcoded colors or static `Colors` imports to the reactive `useTheme()` pattern with dark mode support.

## Usage

User provides a screen filename. This skill converts it.

## Steps

### 1. Read the file and identify violations
Grep for:
- `import { Colors } from '@/constants/colors'` — static import (non-reactive)
- `#[0-9a-fA-F]{3,8}` — hardcoded hex in JSX or inline styles
- `'rgba(...)` — hardcoded rgba values
- Missing `import { useTheme } from '@/hooks/theme-store'`

### 2. Add useTheme
At the top of the component function:
```tsx
const { colors, mode } = useTheme();
```

### 3. Convert inline styles
Replace in JSX (NOT in StyleSheet.create):
- `Colors.primary` → `colors.primary`
- `Colors.text.primary` → `colors.text.primary`
- `Colors.background` → `colors.background`
- `Colors.surface` → `colors.surface`
- `Colors.border` → `colors.border`
- `Colors.shadow` → `colors.shadow`
- `#0066CC` → `colors.primary`
- `#FFFFFF` for text → `colors.text.inverse`
- `#FFFFFF` for bg → `colors.surface`
- `#10B981` → `colors.success`
- `#EF4444` → `colors.error`
- `#F59E0B` → `colors.warning`

### 4. Convert Stack.Screen options
```tsx
// Before:
headerStyle: { backgroundColor: '#0066CC' },
headerTintColor: '#FFFFFF',

// After:
headerStyle: { backgroundColor: colors.primary },
headerTintColor: colors.text.inverse,
```

### 5. Handle StyleSheet.create
Static StyleSheet values can't use hooks. Two approaches:
- **Preferred**: Move color assignments to inline styles `style={[styles.container, { backgroundColor: colors.background }]}`
- **Acceptable**: Keep `Colors.xxx` in StyleSheet (the global tracks theme) for values that don't need per-render reactivity

### 6. Verify dark mode
Check the screen would look correct in dark mode:
- Background should be dark (`colors.background` = `#0D1117`)
- Text should be light (`colors.text.primary` = `#E6EDF3`)
- Borders should be subtle (`colors.border` = `#30363D`)
- Cards/surfaces should be slightly lighter than background

## Output

Report what was changed and verify no hardcoded colors remain.
