---
name: new-screen
description: Scaffold a new Expo Router screen with glass UI, theme colors, haptics, translations, skeleton loaders, and AGCC project conventions
---

# New Screen Scaffolding

Create a new screen file in `app/` following AGCC project conventions.

## Usage

The user will provide:
- **Screen name** (e.g., "equipment-inventory") — used as the filename
- **Screen purpose** — what the screen does
- **Access level** (optional) — owner-only, permission-gated, subscription-gated, or public

## Steps

1. Create `app/{screen-name}.tsx` with this template:

```tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme-store';
import { useAppStore } from '@/hooks/app-store';
import { useTranslation } from '@/constants/translations';
import { HapticFeedback } from '@/utils/HapticFeedback';
import GlassCard from '@/components/GlassCard';
// Import icons from lucide-react-native as needed

export default function {PascalCaseName}Screen() {
  const { colors } = useTheme();
  const { language } = useAppStore();
  const t = useTranslation(language);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: '{Screen Title}',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Screen content here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});
```

2. Add translation keys to `constants/translations.ts` (both `en` and `es` sections)

3. If the screen needs navigation from More tab, add a menu item to `app/(tabs)/more.tsx`

4. If it's a modal, register in `app/_layout.tsx` Stack

## Conventions

- **Colors**: Always use `useTheme().colors` — never hardcode color values
- **Icons**: Use `lucide-react-native` for all icons
- **Haptics**: Use `HapticFeedback.success()`, `.error()`, `.warning()`, `.medium()`
- **Glass UI**: Use `GlassCard`, `GlassButton`, `GlassFAB`, `GlassHeader`
- **Loading**: Use `SkeletonLoader` variants, never `ActivityIndicator`
- **Empty states**: Use `EmptyState` component with icon, title, description, action
- **Domain terms in UI**: "project" (not "job"), "client" (not "customer"), "crew member" (not "technician")
- **Internal types**: Use `Job`, `Customer`, `Technician` in code
- **State**: Access data via `useAppStore()` hook
- **Translations**: All strings via `useTranslation(language)` — add to both en/es
- **Subscription gating**: Check `hasFeature('featureName')` from store
- **Role gating**: Check `userRole === 'owner'` or wrap with `OwnerAuthGuard`
- **Permission gating**: Check `canAccess('permissionKey')` from store
