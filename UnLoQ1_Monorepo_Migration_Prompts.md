# UnLoQ1 — Monorepo Migration: Claude Code Prompts

Task 1 (Turborepo + pnpm init) is already complete. The current state is:
- Root: pnpm-workspace.yaml, turbo.json, root package.json (credx-monorepo)
- apps/credx/ — Next.js app (already moved from root)
- packages/shared/ — @credx/shared (initialized with placeholder index.ts, compiles to dist/)
- .npmrc with shamefully-hoist=true

Run these prompts **in order**, one task at a time. After each, verify with `pnpm turbo build` before proceeding.

---

## TASK 2: Create the directory scaffold inside packages/shared

```
CONTEXT: I am building a Turborepo monorepo. Task 1 is done — apps/credx has the Next.js app, packages/shared exists with a placeholder. This task creates the internal folder structure inside packages/shared to hold all the shared code that will be extracted from apps/credx.

Read @packages/shared/package.json and @packages/shared/tsconfig.json to understand the current setup. The package compiles TS to dist/ via tsc.

TASK: Create the following folder structure inside packages/shared/:

packages/shared/
├── src/
│   ├── types/
│   │   └── index.ts        (will hold all TypeScript types)
│   ├── utils/
│   │   └── index.ts        (will hold currency, calculator, score)
│   ├── store/
│   │   ├── engine/          (will hold purchaseEngine, catalogueEngine, rewardsLedger)
│   │   ├── data/            (will hold couponCatalogue, mocks, JSON data)
│   │   └── index.ts        (will be the store barrel export)
│   └── index.ts            (root barrel: re-exports from types, utils, store)

Update packages/shared/package.json:
- Change "main" to "./dist/src/index.js"
- Change "types" to "./dist/src/index.d.ts"
- Update "exports" to match the new paths
- Add these dependencies (NOT devDependencies): "decimal.js": "^10.6.0", "zustand": "^5.0.11"
- Add these peerDependencies: "react": ">=18"
- Keep existing devDependencies (rimraf, typescript)
- Add "resolveJsonModule": true and "esModuleInterop": true to tsconfig.json compilerOptions
- Change tsconfig.json "rootDir" from "." to "./src"
- Change tsconfig.json "include" from ["*.ts"] to ["src/**/*.ts", "src/**/*.json"]

Delete the old placeholder packages/shared/index.ts (replaced by src/index.ts).

For now, create minimal placeholder exports in each index.ts:
- src/types/index.ts: export {} with a comment "// Types will be extracted here"
- src/utils/index.ts: export {} with a comment "// Utils will be extracted here"
- src/store/index.ts: export {} with a comment "// Store will be extracted here"
- src/index.ts: export * from "./types"; export * from "./utils"; export * from "./store";

VERIFY: Run "pnpm --filter @credx/shared build" and confirm it compiles with zero errors.
```

---

## TASK 3: Extract types into packages/shared

```
CONTEXT: Monorepo migration in progress. apps/credx has the Next.js app. packages/shared has the folder scaffold with placeholder exports. This task extracts all shared TypeScript types.

Read @apps/credx/app/lib/types.ts — this is the file to extract.

TASK: Copy the ENTIRE contents of apps/credx/app/lib/types.ts into packages/shared/src/types/index.ts.

This file has zero external imports — it's pure TS types and interfaces. Copy everything: all type aliases (RewardStatus, RewardType, MerchantCategory, UserTier, OrderStatus), all interfaces (CatalogueItem, CouponOrder, RefundEvent, RewardEntry, UserRewardsProfile, MerchantDisplayInfo, MerchantWithStatus, EarnAction, PoolBalance, LifetimeStats, MonthlyEarning, LoanData, EngagementData, ScoreTier).

DO NOT delete the original apps/credx/app/lib/types.ts yet. Instead, replace its contents with a re-export proxy:

```typescript
// Proxy: re-export from shared package during migration
// This file will be deleted once all imports are updated in Task 8
export * from "@credx/shared";
```

This proxy pattern lets the existing app continue working while we extract other files.

Add @credx/shared as a workspace dependency in apps/credx/package.json:
```json
"dependencies": {
  "@credx/shared": "workspace:*",
  ... (keep all existing deps)
}
```

Run "pnpm install" from the monorepo root to link the workspace.

VERIFY:
1. Run "pnpm --filter @credx/shared build" — must compile with zero errors
2. Run "pnpm --filter credx build" — the Next.js app must still build because the proxy re-exports everything
3. If the Next.js build fails with "Cannot find module @credx/shared", add "transpilePackages": ["@credx/shared"] to apps/credx/next.config.ts
```

---

## TASK 4: Extract utils into packages/shared

```
CONTEXT: Monorepo migration continuing. Types are extracted into packages/shared/src/types/. This task extracts the shared utility functions.

Read these files in apps/credx/app/lib/:
- @apps/credx/app/lib/currency.ts
- @apps/credx/app/lib/calculator.ts
- @apps/credx/app/lib/score.ts

TASK: Copy these three files into packages/shared/src/utils/:

1. Copy currency.ts → packages/shared/src/utils/currency.ts
   - This file likely uses Intl.NumberFormat (no external deps). If it imports from "@/app/lib/types", change that import to "../types" (relative within the package).

2. Copy calculator.ts → packages/shared/src/utils/calculator.ts
   - This file uses Decimal.js (already added as dependency in Task 2). If it imports from types, change to "../types".

3. Copy score.ts → packages/shared/src/utils/score.ts
   - If it imports from types, change to "../types". If it imports from other utils (currency), change to "./currency".

4. Update packages/shared/src/utils/index.ts to be a barrel:
   ```typescript
   export * from "./currency";
   export * from "./calculator";
   export * from "./score";
   ```

DO NOT delete the originals in apps/credx yet. Replace each with a re-export proxy:

apps/credx/app/lib/currency.ts:
```typescript
export * from "@credx/shared";
// Note: this re-exports everything from shared, which includes currency exports
```

Actually, a cleaner proxy approach — since @credx/shared exports everything from a single barrel, and we don't want namespace collisions, use targeted re-exports:

apps/credx/app/lib/currency.ts:
```typescript
export { formatCurrency } from "@credx/shared";
// Add any other named exports that this file originally exported
```

Do the same for calculator.ts and score.ts — re-export only the specific functions each file originally exported, sourced from @credx/shared.

To know what to re-export, check what each file's export statements are BEFORE you move them.

VERIFY:
1. Run "pnpm --filter @credx/shared build" — zero errors
2. Run "pnpm --filter credx build" — Next.js app still builds via the proxies
```

---

## TASK 5: Extract store and engines into packages/shared

```
CONTEXT: Monorepo migration continuing. Types and utils are in packages/shared. This task extracts the rewards store, engines, and data — the largest extraction.

Read these directories and files:
- @apps/credx/app/lib/rewards/engine/purchaseEngine.ts
- @apps/credx/app/lib/rewards/engine/catalogueEngine.ts
- @apps/credx/app/lib/rewards/engine/rewardsLedger.ts
- @apps/credx/app/lib/rewards/data/couponCatalogue.ts
- @apps/credx/app/lib/rewards/data/rewardsMock.ts
- @apps/credx/app/lib/rewards/data/userMock.ts
- @apps/credx/app/lib/rewards/index.ts (barrel export)
- @apps/credx/app/lib/rewards/store.ts (Zustand store)
- @apps/credx/data/rewards/merchants.json
- @apps/credx/data/rewards/earn-actions.json

TASK: Copy all of the above into packages/shared/src/store/ preserving the internal structure:

packages/shared/src/store/
├── engine/
│   ├── purchaseEngine.ts
│   ├── catalogueEngine.ts
│   └── rewardsLedger.ts
├── data/
│   ├── couponCatalogue.ts
│   ├── rewardsMock.ts
│   ├── userMock.ts
│   ├── merchants.json
│   └── earn-actions.json
├── store.ts
└── index.ts

For every copied file, update imports:
- "@/app/lib/types" → "../../types" (or "../types" depending on depth)
- "@/app/lib/currency" → "../../utils/currency"
- "@/app/lib/rewards/engine/..." → "./engine/..."
- "@/app/lib/rewards/data/..." → "./data/..."
- "@/data/rewards/merchants.json" → "./data/merchants.json"
- "@/data/rewards/earn-actions.json" → "./data/earn-actions.json"

CRITICAL — store.ts handling:
The current store.ts starts with "use client" — this is a Next.js directive that CANNOT exist in a shared package. Handle it like this:

1. Copy store.ts to packages/shared/src/store/store.ts BUT REMOVE the "use client" directive from line 1
2. The store file uses fetch() calls to API routes like "/api/rewards/merchants" — these are relative URLs that only work in a browser/Next.js context. This is FINE for now because the mobile app will later need a configurable base URL. Leave the fetch calls as-is.
3. Export useRewardsStore from the barrel

Then in apps/credx, create a thin client wrapper:

apps/credx/app/lib/rewards/store.ts (replace existing file with):
```typescript
"use client";
// Re-export from shared package with "use client" directive for Next.js
export { useRewardsStore } from "@credx/shared";
```

For the rewards barrel export, replace apps/credx/app/lib/rewards/index.ts with:
```typescript
export * from "@credx/shared";
```

Update packages/shared/src/store/index.ts to be the barrel:
```typescript
// Data
export { couponCatalogue } from "./data/couponCatalogue";
export { rewardEntries, MOCK_USER_ID, COMPUTED_CONFIRMED_BALANCE, COMPUTED_PENDING_BALANCE } from "./data/rewardsMock";
export { mockUserProfile, mockLoanData } from "./data/userMock";

// Engine
export { getCatalogue, getCatalogueItem, getMerchantDenominations, getMerchantStock, getAllMerchantsWithStatus } from "./engine/catalogueEngine";
export { initiatePurchase, confirmPayment, generateVoucher, deliverVoucher, getOrderById, getUserOrders, getOrderStore } from "./engine/purchaseEngine";
export { getPoolBalance, getRecentActivity, getMonthlyEarnings, getLifetimeStats, redeemFromPool, restoreRecentRedemption, addPlatformBonus, creditCashback, resetLedger } from "./engine/rewardsLedger";

// Store
export { useRewardsStore } from "./store";
```

Update packages/shared/src/index.ts root barrel to include store:
```typescript
export * from "./types";
export * from "./utils";
export * from "./store";
```

VERIFY:
1. Run "pnpm --filter @credx/shared build" — this is the critical check; all internal imports must resolve
2. If build fails with JSON import errors, ensure tsconfig has "resolveJsonModule": true and "esModuleInterop": true
3. If build fails with "Cannot find module" for internal imports, check relative paths — common mistake is off-by-one directory depth
4. Run "pnpm --filter credx build" — the Next.js app must still build using the proxy files and the client wrapper
5. If you get "use client" errors, verify the wrapper at apps/credx/app/lib/rewards/store.ts has "use client" on line 1
```

---

## TASK 6: Configure shared TypeScript config

```
CONTEXT: Monorepo migration — types, utils, and store are all extracted into packages/shared. This task adds a proper shared TypeScript configuration.

Read @packages/shared/tsconfig.json and @apps/credx/tsconfig.json.

TASK: Create a base TypeScript config at packages/shared/tsconfig.base.json:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  }
}
```

Update packages/shared/tsconfig.json to extend the base:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Update the root tsconfig.json to reference all workspaces:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "skipLibCheck": true
  },
  "references": [
    { "path": "packages/shared" },
    { "path": "apps/credx" }
  ]
}
```

Add a "typecheck" script to the root turbo.json tasks if not already present:
```json
"typecheck": {
  "dependsOn": ["^build"]
}
```

Add a "typecheck" script to packages/shared/package.json scripts:
```json
"typecheck": "tsc --noEmit"
```

And to apps/credx/package.json scripts:
```json
"typecheck": "tsc --noEmit"
```

VERIFY:
1. Run "pnpm --filter @credx/shared build" — zero errors
2. Run "pnpm turbo typecheck" — both workspaces pass
```

---

## TASK 7: Add typecheck task to turbo.json and workspace dependency declarations

```
CONTEXT: Monorepo migration — all shared code is extracted, TypeScript configs are set. This task ensures the dependency graph is correctly declared so Turborepo builds packages in the right order.

Read @turbo.json, @packages/shared/package.json, and @apps/credx/package.json.

TASK:

1. Verify turbo.json has these tasks (update if missing):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "clean": {
      "cache": false
    }
  }
}
```

2. Verify apps/credx/package.json has @credx/shared as a dependency:
```json
"dependencies": {
  "@credx/shared": "workspace:*",
  ... (all existing deps)
}
```

3. Verify packages/shared/package.json has the correct dependency setup:
- dependencies: decimal.js, zustand
- peerDependencies: react (>=18) — NOT a direct dependency (avoids dual React instance bug)
- devDependencies: rimraf, typescript

4. Check for dual React instances — this is the most common monorepo bug:
Run from the monorepo root terminal:
```bash
find . -path ./apps/credx/node_modules -prune -o -name "react" -path "*/node_modules/react" -print
```
If react appears anywhere inside packages/shared/node_modules, something is wrong. React must only exist in apps/credx/node_modules (or the root hoisted node_modules). If it appears in packages/shared, remove react from packages/shared dependencies and ensure it's only in peerDependencies.

VERIFY:
1. Run "pnpm install" from root
2. Run "pnpm turbo build --dry" — check execution order shows @credx/shared builds BEFORE credx
3. Run "pnpm turbo build" — full build passes
```

---

## TASK 8: Update all imports in apps/credx

```
CONTEXT: Monorepo migration — all shared code is extracted into packages/shared with proxy re-exports in apps/credx. This task removes the proxy files and updates all imports across the Next.js app to import directly from @credx/shared.

IMPORTANT: Read each proxy file first to understand what it re-exports. Then search for ALL consumers of that file.

TASK:

Step 1 — Update type imports across the entire apps/credx codebase:

Search for all files that import from "@/app/lib/types" or "../lib/types" or "../../lib/types" (any relative variant). There will be 20+ files. Change every single one to:
```typescript
import type { WhateverType } from "@credx/shared";
```
Use "import type" (not just "import") for type-only imports — this is a TypeScript best practice that prevents runtime import of type-only modules.

After ALL type consumers are updated, delete apps/credx/app/lib/types.ts (the proxy).

Step 2 — Update utility imports:

Search for all files importing from "@/app/lib/currency", "@/app/lib/calculator", "@/app/lib/score".
Change each to import from "@credx/shared":
```typescript
import { formatCurrency } from "@credx/shared";
import { calculateEMI, calculateNewTenure } from "@credx/shared";
```

After ALL utility consumers are updated, delete the proxy files:
- apps/credx/app/lib/currency.ts
- apps/credx/app/lib/calculator.ts
- apps/credx/app/lib/score.ts

Step 3 — Update rewards/store imports:

Search for all files importing from "@/app/lib/rewards" or "@/app/lib/rewards/store" or any subpath.

For CLIENT COMPONENTS (files with "use client" at the top):
Import useRewardsStore from the local client wrapper (NOT directly from @credx/shared):
```typescript
import { useRewardsStore } from "@/app/lib/rewards/store";
```
This wrapper at apps/credx/app/lib/rewards/store.ts has the "use client" directive. KEEP this file.

For API ROUTES (files under apps/credx/app/api/):
Import engine functions directly from @credx/shared:
```typescript
import { getAllMerchantsWithStatus, initiatePurchase, confirmPayment, creditCashback } from "@credx/shared";
```

After updating all consumers, delete:
- apps/credx/app/lib/rewards/index.ts (the proxy barrel — no longer needed)
- apps/credx/app/lib/rewards/engine/ (entire directory — moved to packages/shared)
- apps/credx/app/lib/rewards/data/ (entire directory — moved to packages/shared)

KEEP:
- apps/credx/app/lib/rewards/store.ts (the "use client" wrapper — still needed)

Step 4 — Update data imports:

Search for any files importing from "@/data/rewards/merchants.json" or "@/data/rewards/earn-actions.json". These JSON files moved to packages/shared. Update imports to come from @credx/shared (they should be exported from the store barrel).

If there are direct JSON imports in pages or components, change them to use the barrel export.

Delete apps/credx/data/rewards/ directory after confirming no direct importers remain.

Step 5 — Final grep check:

Run these searches to confirm ZERO stale imports remain:
- Search for "@/app/lib/types" in all .ts/.tsx files under apps/credx
- Search for "@/app/lib/currency" in all .ts/.tsx files
- Search for "@/app/lib/calculator" in all .ts/.tsx files
- Search for "@/app/lib/score" in all .ts/.tsx files
- Search for "@/app/lib/rewards/engine" in all .ts/.tsx files
- Search for "@/app/lib/rewards/data" in all .ts/.tsx files
- Search for "@/app/lib/rewards/index" or from "@/app/lib/rewards"" (not store) in all files
- Search for "@/data/rewards/" in all .ts/.tsx files

Every match is a missed import that will cause a build failure. Fix them all.

VERIFY:
1. Run "pnpm --filter @credx/shared build" — zero errors
2. Run "pnpm --filter credx build" — full Next.js build passes with zero errors
3. If you get "Module not found" errors, a consumer is still importing from a deleted file — check the error path and fix the import
```

---

## TASK 9: Add typecheck and update turbo pipeline caching

```
CONTEXT: All imports are updated, proxies are deleted, the app builds. This task fine-tunes the pipeline.

Read @turbo.json.

TASK:

1. Add a "typecheck" script to apps/credx/package.json if not already present:
```json
"typecheck": "tsc --noEmit"
```

2. Add a "typecheck" script to packages/shared/package.json if not already present:
```json
"typecheck": "tsc --noEmit"
```

3. Verify turbo.json has proper cache inputs — add input globs so Turborepo knows when to invalidate cache:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig.json", "package.json"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "app/**", "tsconfig.json"]
    },
    "lint": {
      "inputs": ["src/**", "app/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

4. Add ".turbo" to .gitignore if not already there.

5. Run the full pipeline verification:
```bash
pnpm turbo typecheck
pnpm turbo build
pnpm turbo dev  (verify dev server starts, test a few page routes, then Ctrl+C)
```

VERIFY: All three commands succeed. The dev server loads the homepage and /rewards page.
```

---

## TASK 10: Update Vercel deployment config

```
CONTEXT: Monorepo is fully functional locally. This task ensures Vercel can build and deploy the web app from the monorepo.

Read @apps/credx/vercel.json and the root @package.json.

TASK:

1. Move vercel.json from apps/credx/ to the monorepo ROOT if it's not already there. Vercel reads this from the root for monorepo projects.

2. Update vercel.json for monorepo deployment. The config should tell Vercel that the Next.js app lives in apps/credx:

OPTION A — If using vercel.json:
```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=credx",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```
Keep this in apps/credx/vercel.json. Then in Vercel Dashboard, set Root Directory to "apps/credx".

OPTION B — If using Vercel Dashboard (preferred for monorepos):
- Set Root Directory: apps/credx
- Set Build Command: cd ../.. && pnpm turbo build --filter=credx
- Set Install Command: pnpm install (run at root)
- Set Framework: Next.js

3. Ensure root package.json has the exact packageManager field:
```json
"packageManager": "pnpm@9.15.0"
```
Vercel uses this to install the correct pnpm version. Without it, you get "pnpm: command not found".

4. If Vercel build fails with workspace resolution errors, add this environment variable in the Vercel Dashboard:
ENABLE_EXPERIMENTAL_COREPACK=1

DO NOT actually deploy to production yet. Just verify the configuration is correct. If you want to test, push to a feature branch and check the Vercel preview deploy.

VERIFY: Configuration files are correct and consistent. No action needed until the branch is pushed.
```

---

## TASK 11: Initialize Expo app in apps/mobile

```
CONTEXT: Monorepo is fully working for web. This task creates the mobile app foundation.

TASK:

1. From the monorepo root, initialize an Expo app:
```bash
npx create-expo-app@latest apps/mobile --template blank-typescript
```

2. After creation, update apps/mobile/package.json:
- Change "name" to "credx-mobile"
- Add workspace dependency: "@credx/shared": "workspace:*"

3. Configure Metro bundler to resolve workspace packages. Create or update apps/mobile/metro.config.js:
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the shared packages directory
config.watchFolders = [monorepoRoot];

// Resolve modules from monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure packages/shared dist is resolved
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
```

4. Create a simple test screen to verify shared package imports work. Update apps/mobile/App.tsx:
```typescript
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import type { CatalogueItem, PoolBalance } from '@credx/shared';
import { formatCurrency } from '@credx/shared';

export default function App() {
  const testBalance: PoolBalance = { confirmed: 549, pending: 120 };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UnLoQ1 Mobile</Text>
      <Text style={styles.subtitle}>
        Pool Balance: {formatCurrency(testBalance.confirmed)}
      </Text>
      <Text style={styles.info}>@credx/shared imported successfully</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#1e3a5f', marginBottom: 4 },
  info: { fontSize: 14, color: '#22c55e', marginTop: 16 },
});
```

5. Add dev script to apps/mobile/package.json if not present:
```json
"scripts": {
  "dev": "expo start",
  "build": "echo 'Mobile build not configured yet'"
}
```

6. Run pnpm install from monorepo root to link everything.

VERIFY:
1. Run "pnpm --filter @credx/shared build" first (mobile needs the compiled dist/)
2. Run "pnpm --filter credx-mobile dev" — Expo dev server should start and show QR code
3. If it crashes with "Unable to resolve module @credx/shared" — the Metro config watchFolders or nodeModulesPaths are wrong. Check that the paths resolve correctly by adding console.log statements to metro.config.js.
4. If types import fine but runtime functions fail, ensure packages/shared built successfully (the dist/ folder must exist with compiled JS)
```

---

## TASK 12: Final end-to-end verification

```
CONTEXT: Monorepo migration is complete. Web app in apps/credx, mobile app in apps/mobile, shared code in packages/shared. This task is the final verification pass.

TASK:

1. Full build pipeline:
```bash
pnpm install
pnpm turbo build
```
Both @credx/shared and credx must build. apps/mobile build can be a no-op for now.

2. TypeScript check across all workspaces:
```bash
pnpm turbo typecheck
```
Zero errors in all workspaces.

3. Dev server check:
```bash
pnpm --filter credx dev
```
Open http://localhost:3000 and test:
- Homepage (calculator with EMI functions from @credx/shared)
- /rewards (dashboard with pool balance from @credx/shared store)
- /rewards/earn (catalogue from @credx/shared)
- /rewards/my-cards (orders from @credx/shared)
- /rewards/pool (pool balance and earnings)
- /pay-now (pool redemption)

4. Stale import hunt — search for any remaining old import paths:
```bash
grep -r "@/app/lib/types" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "@/app/lib/currency" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "@/app/lib/calculator" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "@/app/lib/score" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "@/app/lib/rewards/engine" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "@/app/lib/rewards/data" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "@/data/rewards" apps/credx/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```
Fix any matches found.

5. Verify the file cleanup — these directories should NO LONGER exist in apps/credx:
- apps/credx/app/lib/rewards/engine/ (moved to packages/shared)
- apps/credx/app/lib/rewards/data/ (moved to packages/shared)
- apps/credx/app/lib/types.ts (replaced by @credx/shared import)
- apps/credx/app/lib/currency.ts (replaced by @credx/shared import)
- apps/credx/app/lib/calculator.ts (replaced by @credx/shared import)
- apps/credx/app/lib/score.ts (replaced by @credx/shared import)
- apps/credx/data/rewards/ (moved to packages/shared)

These SHOULD still exist:
- apps/credx/app/lib/rewards/store.ts (the "use client" wrapper — must stay)
- apps/credx/app/lib/animation.ts (Framer Motion — web-only, NOT shared)
- apps/credx/app/lib/featureFlags.ts (app-specific config — NOT shared)
- apps/credx/app/lib/iconMap.tsx (React component — NOT shared)

6. Commit the final state:
```bash
git add -A
git commit -m "Complete monorepo migration: apps/credx + packages/shared + apps/mobile scaffold"
```

Report a summary of everything verified and any issues found.
```

---

## Usage Instructions

1. Open credx project in Cursor
2. Open Claude Code panel
3. Paste one task prompt at a time, starting from Task 2
4. After each task, verify the build passes before proceeding
5. If a task fails, fix the errors before moving to the next
6. After Task 12, the monorepo is production-ready

**Estimated time per task:** 5-20 minutes. Total: ~2-3 hours with review time.
