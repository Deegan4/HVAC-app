# App Improvements - Usage Guide

## Overview
This guide shows you how to use the new components added to improve the user experience.

## 1. Skeleton Loaders

Use skeleton loaders to show loading states instead of blank screens or spinners.

### Components Available:
- `SkeletonLoader` - Basic animated skeleton
- `SkeletonJobCard` - Job card skeleton
- `SkeletonInvoiceCard` - Invoice card skeleton  
- `SkeletonCustomerItem` - Customer item skeleton
- `SkeletonStatCard` - Stat card skeleton
- `SkeletonList` - Render multiple skeleton cards

### Usage Example:
```tsx
import { SkeletonList, SkeletonJobCard } from '@/components/SkeletonLoader';

if (isLoading) {
  return <SkeletonList count={5} CardComponent={SkeletonJobCard} />;
}
```

## 2. Empty States

Use the EmptyState component to provide helpful guidance when there's no data.

### Usage Example:
```tsx
import EmptyState from '@/components/EmptyState';
import { Calendar } from 'lucide-react-native';

<EmptyState
  icon={Calendar}
  title="No Jobs Today"
  description="You don't have any scheduled jobs for today. Create your first job to get started."
  actionLabel="Add New Job"
  onAction={() => router.push('/new-job')}
  secondaryActionLabel="View All Jobs"
  onSecondaryAction={() => router.push('/jobs')}
/>
```

## 3. Animated Buttons

Use AnimatedButton for buttons that need press animations and haptic feedback.

### Usage Example:
```tsx
import AnimatedButton from '@/components/AnimatedButton';
import { Colors } from '@/constants/colors';

<AnimatedButton
  onPress={handleSubmit}
  hapticType="medium"
  style={{
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
  }}
  textStyle={{
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  }}
>
  Submit
</AnimatedButton>
```

### Haptic Types:
- `light` - Subtle feedback (default)
- `medium` - Moderate feedback
- `heavy` - Strong feedback
- `selection` - For selection changes

## 4. Haptic Feedback Utility

Use the HapticFeedback utility for manual haptic feedback.

### Usage Example:
```tsx
import { HapticFeedback } from '@/utils/HapticFeedback';

// Success feedback
HapticFeedback.success();

// Error feedback
HapticFeedback.error();

// Warning feedback
HapticFeedback.warning();

// Impact feedback
HapticFeedback.light();
HapticFeedback.medium();
HapticFeedback.heavy();

// Selection feedback
HapticFeedback.selection();
```

## 5. QuickBooks Integration

The QuickBooks integration screen has been updated with improved styling:
- Better shadows and elevation
- Improved card design
- More polished overall appearance

## Best Practices

### Skeleton Loaders
- Use skeleton loaders for initial data fetches
- Match the skeleton layout to the actual content
- Keep skeleton animations subtle

### Empty States
- Always provide clear next steps
- Use appropriate icons that match the context
- Include helpful descriptions
- Offer primary and secondary actions when relevant

### Haptic Feedback
- Use light haptics for frequent actions (list scrolling, button taps)
- Use medium haptics for important actions (form submissions, deletions)
- Use heavy haptics for critical actions (confirmations, warnings)
- Use success/error/warning for feedback on action results

### Animations
- Keep animations quick (200-300ms)
- Use spring animations for natural feel
- Don't animate everything - use sparingly
- Ensure animations don't block user interaction

## Implementation Checklist

When updating a screen:
1. [ ] Replace ActivityIndicator with skeleton loaders
2. [ ] Add empty state component for no-data scenarios
3. [ ] Use AnimatedButton for primary actions
4. [ ] Add haptic feedback to key interactions
5. [ ] Test on both iOS and Android
6. [ ] Verify web compatibility (haptics are disabled on web automatically)

## Notes
- All haptic feedback automatically checks for web platform and skips on web
- Skeleton loaders use React Native's Animated API for broad compatibility
- Empty states are fully customizable with any Lucide icon
- AnimatedButton works with both text and custom components as children

## Completed Scope (Removed from Roadmap)
- Owner-only PIN setup/auth flows and guardrails
- Technician permissions console for owner-managed access
- Apple Notes import pipeline for owner documents
- Terms & Conditions contact block update (cybertec44@yahoo.com / (239) 839-2112)

## Four-Phase Roadmap — COMPLETED

### Phase 1 – Onboarding & Localization Reliability ✅
- Wired `LanguageSelectionScreen` as first auth gate before role selection in `app/_layout.tsx`
- Fixed hardcoded `language = 'en' as const` in `app-store.tsx` — now reads from AsyncStorage via auth query
- Added `setLanguage()` method to app store for persisting language preference
- Wired all `OnboardingTutorial` step titles/descriptions through `useTranslation()` instead of hardcoded English
- All UI strings (Skip, Next, Get Started, progress text) now respect selected locale

### Phase 2 – App-Wide Dark Mode Consistency ✅
- Rewrote all 5 glass components (`GlassCard`, `GlassButton`, `GlassFAB`, `GlassHeader`, `GlassTabBar`) to use `useTheme()` with dark mode variants
- Replaced hardcoded `rgba(255,255,255,...)` borders/overlays with mode-aware styles
- BlurView `tint` now flips between `'light'` and `'dark'` based on theme
- Replaced hardcoded `#0066CC` / `#FFFFFF` header colors in `_layout.tsx`, `technician-location.tsx` with `colors.primary` / `colors.text.inverse`
- Updated `technician-permissions.tsx` to use `useTheme()` throughout (was all static `Colors.xxx`)

### Phase 3 – Technician Workflow Polish & Safeguards ✅
- Replaced `ActivityIndicator` with `SkeletonList` + `SkeletonCustomerItem` in customers tab
- Replaced `ActivityIndicator` with `SkeletonList` + `SkeletonInvoiceCard` in invoices tab
- Added `EmptyState` component with icons and action buttons to customers list
- Technician permissions screen fully theme-aware with dynamic colors
- Tracking screen already had status chips, empty states, analytics view, and offline-ready architecture

### Phase 4 – Quality, Observability, and Launch Readiness ✅
- Created `utils/AnalyticsLogger.ts` — centralized structured logging for onboarding, auth, theme, navigation, CRUD, tracking, and errors
- Logger is a singleton with typed event categories, ready to swap console output for a real SDK (Firebase, Mixpanel, etc.)
- All phases documented in this file as a release changelog
- Rebranded from Morgan Marine CC (MMCC) to AGCC (All General Contractors)
