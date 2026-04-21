---
name: add-translation
description: Add new translation keys to both English and Spanish in constants/translations.ts
---

# Add Translation Keys

Add new user-facing strings to the AGCC translation system.

## Usage

The user provides the English text. This skill:
1. Generates a camelCase key name
2. Adds the English string to the `en` section
3. Adds the Spanish translation to the `es` section
4. Places it in the correct section (grouped by feature)

## Rules

- Keys are camelCase: `noProjectsFound`, `createNewInvoice`
- Group keys under the appropriate comment section (Home Screen, Customer Screen, Invoice Screen, More Screen, etc.)
- If no section fits, add a new comment section
- Spanish translations must be natural, not machine-literal
- Both `en` and `es` must stay in sync — same keys in same order

## Steps

1. Read `constants/translations.ts`
2. Determine the correct section for the new key(s)
3. Add the English string in the `en` object
4. Add the Spanish string in the `es` object at the same relative position
5. Verify both objects have the same keys
