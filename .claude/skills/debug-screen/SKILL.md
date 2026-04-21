---
name: debug-screen
description: Diagnose and fix a broken or misbehaving AGCC screen — blank renders, state issues, navigation problems, style bugs
---

# Debug Screen

Systematically diagnose why an AGCC screen isn't working correctly.

## Usage

User reports a problem with a screen. Could be:
- Blank/white screen
- Data not loading
- Navigation not working
- Styles broken
- Dark mode not working
- Crash/error

## Diagnostic Steps

### Step 1: Read the screen file
- Check imports for missing/wrong paths
- Check component export (must be `export default function`)
- Check hooks are at top level (not inside conditions/loops)

### Step 2: Check store connection
- Verify `useAppStore()` destructures the right fields
- Check if the data query is loading (`isLoading` check)
- Verify the data exists in mock data or AsyncStorage

### Step 3: Check navigation
- Is the screen registered in `app/_layout.tsx` Stack?
- Is the route correct in the caller (`router.push('/screen-name')`)?
- For tabs: is it in `app/(tabs)/` with matching `_layout.tsx` entry?
- For modals: does it have `presentation: "modal"` in Stack.Screen?

### Step 4: Check styling
- Is `useTheme()` called and `colors` destructured?
- Is the container `flex: 1` with `backgroundColor: colors.background`?
- Are text elements using `color: colors.text.primary`?
- Is content scrollable (ScrollView/FlatList)?

### Step 5: Check for common gotchas
- `useMemo` deps array missing a dependency → stale data
- Return object in app-store missing the new field → undefined
- `useCallback` capturing stale closure values
- `SafeAreaView` not imported from `react-native-safe-area-context`
- Missing `edges` prop on SafeAreaView causing header overlap

### Step 6: Check Metro bundler
- `curl http://localhost:8081/status` returns `packager-status:running`
- Request the bundle directly to check for compile errors
- Check terminal for red error output

## Output

1. **Root cause**: What's actually wrong
2. **Fix**: Exact code change with file:line
3. **Prevention**: What convention would have prevented this
