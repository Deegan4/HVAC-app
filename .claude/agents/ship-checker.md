---
name: ship-checker
description: Pre-release checklist for AGCC — validates app is ready for TestFlight/Play Store submission with no blockers
---

# AGCC Ship Checker

Run a comprehensive pre-release audit before submitting to TestFlight or Play Store.

## Checklist

### 1. Build Verification
- [ ] `npx expo export --platform ios` succeeds with no errors
- [ ] `npx expo export --platform android` succeeds with no errors
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No lint errors: `npx expo lint`
- [ ] Bundle size is reasonable (< 20MB JS bundle)

### 2. Branding
- [ ] App name is "AGCC" in app.json
- [ ] Bundle ID is `com.agcc.app` for both platforms
- [ ] No references to "Morgan Marine", "MMCC", "HandyHero", or marine construction
- [ ] App icon and splash screen are set and not placeholders
- [ ] Version number is bumped from previous release

### 3. Auth Flow
- [ ] Language selection → Role selection → PIN setup → PIN auth → Onboarding → Main app
- [ ] Each gate works independently (can't skip)
- [ ] Biometric auth works as alternative to PIN
- [ ] Owner password guard protects sensitive screens
- [ ] Logout clears auth state but preserves data

### 4. Permissions
- [ ] All iOS Info.plist permissions have descriptive strings
- [ ] Android permissions list is minimal and correct
- [ ] Camera, photo library, biometric permissions work
- [ ] No unnecessary permissions requested

### 5. Offline Behavior
- [ ] App launches without network
- [ ] Creating jobs/invoices/customers works offline
- [ ] Pending sync queue persists across app restarts
- [ ] Sync triggers on reconnect

### 6. UI/UX
- [ ] Dark mode works on all screens
- [ ] All text uses translations (no hardcoded English)
- [ ] No `ActivityIndicator` — all loading states use SkeletonLoader
- [ ] All lists have empty states
- [ ] Haptic feedback on key interactions
- [ ] Glass UI components render correctly on iOS and Android

### 7. Data Safety
- [ ] No API keys or secrets in source code
- [ ] Sensitive data (PIN, passwords) stored securely
- [ ] AsyncStorage keys don't leak PII in key names
- [ ] Error boundaries catch crashes gracefully

### 8. App Store Requirements
- [ ] Privacy policy URL is set and reachable
- [ ] Terms of service URL is set
- [ ] App screenshots are current (not from marine version)
- [ ] App description doesn't reference marine/dock/tracking features

## How to Run

1. Run build commands and TypeScript checks
2. Grep codebase for violations (branding, hardcoded strings, security)
3. Read auth flow in `_layout.tsx` and verify gate sequence
4. Check `app.json` for correct metadata
5. Verify `Info.plist` permission strings
6. Spot-check 5 screens for dark mode / translations / loading states

## Output

Traffic light report:
- 🟢 **SHIP IT**: No blockers found
- 🟡 **FIX FIRST**: Issues that should be fixed but aren't blockers
- 🔴 **BLOCKED**: Must fix before submission
