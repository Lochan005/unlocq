1. Full Rewards System (New Feature)
The biggest addition — a complete rewards/loyalty system was built from scratch:
New pages: rewards/earn, rewards/pool, rewards/redeem, rewards/tiers, plus a shared rewards layout
Rewards engine: Built under app/lib/rewards/ with a click handler, rewards ledger, routing engine, mock data for merchants and users
State management: Added Zustand (zustand@^5.0.11) for a global rewards store (app/lib/rewards/store.ts)
API routes: 6 new API endpoints under app/api/rewards/ — bonus, click, ledger, merchants, profile, redeem
UI components: New rewards-specific components — HeaderRewardsIndicator, ConsentModal, PoolBalanceDisplay, TierBadge, StreakBadge, StatusBadge, MerchantStatusPill, ComplianceFooter
Data files: data/rewards/earn-actions.json and data/rewards/merchants.json
2. Rewards Integration into Existing Pages
Header: Added HeaderRewardsIndicator to both desktop and mobile nav
Pay Now: Added a "Pay from Rewards Pool" section, allowing users to redeem pool balance toward a loan prepayment
Lump Sum & Monthly Extra: Added "Set Reminder" buttons that award +25 bonus coins, with a toast notification
3. UI/Branding Refresh
Color scheme update: Header navigation shifted from purple tones (#9678CD, #B19CD7, #5B4B8A) to indigo tones (#5C6BC0, #9FA8DA, #303F9F)
Icons overhaul: Replaced emoji icons (lightbulb, coins, calendar, arrows, chart) on the homepage with Phosphor Icons (@phosphor-icons/react@^2.1.10) — duotone style, consistent sizing
Custom icon: New UnLoQ1Coin SVG component under app/components/icons/
4. About Us Page Rewrite
Rewrote the placeholder "under development" copy into a full company description — founding year, Bengaluru HQ, mission, legal/compliance placeholders
5. New Utility Libraries
app/lib/currency.ts — currency formatting helper
app/lib/score.ts — scoring utility
app/lib/types.ts — shared TypeScript type definitions
app/lib/iconMap.tsx — centralized icon mapping
6. Dependency Updates
Added: @phosphor-icons/react, zustand
Updated: next from 16.1.1 to ^16.1.6
7. Cleanup
Deleted: ABSTRACT.md, API_SETUP.md, ARCHITECTURE.md, change post safari fix attempt.md — removed documentation/notes files that are no longer needed
Minor tsconfig.json adjustments