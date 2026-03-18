# UnLoQ1 — Coupon Card Migration: Claude Code Prompts

Run these prompts **in order**, one layer at a time, inside Claude Code (via Cursor extension or terminal). After each layer, review the diffs and run `npx tsc --noEmit` before proceeding to the next.

---

## LAYER 1: Types + Data Files

**Paste this prompt into Claude Code:**

```
CONTEXT: I am migrating the UnLoQ1 rewards system from an affiliate marketing model to a coupon card marketplace model. This is Layer 1 of 7 — rewriting types and data files only. Do NOT touch engine files, store, API routes, components, or pages in this layer.

BUSINESS MODEL CHANGE:
- OLD: Users click affiliate tracked links → shop on merchant sites → affiliate network sends postback with commission → 85% credited to user's prepayment pool
- NEW: Users buy discounted coupon cards on UnLoQ1 (e.g., pay ₹450 for a ₹500 Swiggy card) → voucher code is generated and delivered → cashback (e.g., 2% of face value) is credited to prepayment pool → pool balance is used toward home loan prepayment

TASK 1 — Rewrite @app/lib/types.ts:

DELETE these types entirely (they are affiliate-specific and have no equivalent in the new model):
- MerchantRoute (affiliate tracking routes)
- ClickEvent (outbound click tracking)
- PostbackEvent (inbound commission reconciliation)
- PostbackLogEntry (postback audit trail)
- PostbackStatus type
- RewardBasis type

MODIFY these types:
- RewardStatus: change from "tracked" | "pending" | "under_confirmation" | "confirmed" | "redeemed" | "rejected" to "ordered" | "payment_pending" | "payment_confirmed" | "voucher_generated" | "delivered" | "redeemed" | "expired" | "refunded"
- RewardType: change from "affiliate" | "platform_bonus" | "non_monetary" to "coupon_cashback" | "platform_bonus" | "non_monetary"
- MerchantCategory: keep as-is (food, grocery, shopping, fashion, beauty, electronics, entertainment, travel)
- UserTier: keep as-is (bronze, silver, gold, platinum)
- RewardEntry: remove click_id, network, gross_commission, platform_topup fields. Add order_id (string | null) field. Keep reward_id, user_id, merchant_id, reward_type, user_share, coins_credited, status, campaign_ref, status_history, created_at, confirmed_at, redeemed_at.
- UserRewardsProfile: remove consent_affiliate_tracking and consent_granted_at. Add total_cards_purchased (number). Keep all other fields.
- MerchantWithStatus: change status from "active" | "inactive" to "in_stock" | "out_of_stock"
- EngagementData: remove hasRecentPostbackCredit. Add hasRecentCouponPurchase (boolean).
- MonthlyEarning: keep as-is (it already works for cashback grouping by merchant)

ADD these new types:
- CatalogueItem: { item_id: string; merchant_id: string; merchant_display_name: string; icon_key: string; category: MerchantCategory; face_value: number; discount_pct: number; discounted_price: number; cashback_pct: number; cashback_amount: number; in_stock: boolean; source: "aggregator" | "direct"; valid_till: string; }
- CouponOrder: { order_id: string; user_id: string; item_id: string; merchant_id: string; merchant_display_name: string; face_value: number; discounted_price: number; cashback_amount: number; payment_method: "upi" | "card" | "net_banking"; payment_status: "pending" | "confirmed" | "failed" | "refunded"; voucher_code: string | null; voucher_status: "pending_generation" | "generated" | "delivered" | "delivery_failed" | "redeemed" | "expired"; delivery_channel: "on_screen" | "sms" | "email" | null; deep_link: string | null; expiry_date: string | null; idempotency_key: string; created_at: string; payment_confirmed_at: string | null; voucher_generated_at: string | null; delivered_at: string | null; redeemed_at: string | null; }
- OrderStatus: "initiated" | "payment_pending" | "payment_confirmed" | "payment_failed" | "voucher_generating" | "voucher_generated" | "delivered" | "delivery_failed" | "redeemed" | "expired" | "refund_initiated" | "refund_completed"
- RefundEvent: { refund_id: string; order_id: string; user_id: string; amount: number; reason: "generation_failed" | "invalid_code" | "user_request" | "expired_unredeemed"; refund_method: "upi" | "card" | "net_banking"; refund_status: "initiated" | "processing" | "completed" | "failed"; cashback_reversed: boolean; created_at: string; completed_at: string | null; }

KEEP these types unchanged:
- MerchantDisplayInfo, EarnAction, PoolBalance, LifetimeStats, LoanData, ScoreTier

TASK 2 — Rewrite @app/lib/rewards/data/merchantRoutes.ts:

Rename this file to couponCatalogue.ts. Delete all the old affiliate route code. Create a new export called `couponCatalogue` which is an array of CatalogueItem objects for the same 12 merchants (Swiggy, Zomato, Blinkit, Zepto, BigBasket, Amazon, Flipkart, Myntra, Nykaa, Croma, BookMyShow, MakeMyTrip). Each merchant should have 2-3 denomination options. Example for Swiggy: ₹250, ₹500, ₹1000 face values. Use realistic discount percentages (2-8%) and cashback percentages (1-3%). Set source as "aggregator" for all. Set valid_till to "2026-06-30". Mark BookMyShow and MakeMyTrip as out_of_stock (in_stock: false).

TASK 3 — Update @data/rewards/earn-actions.json:

Add a new action: { action_id: "first_card_purchase", action_name: "First card purchase", coins: 200, type: "one-time", icon_emoji: "🎫", description: "Buy your first coupon card on UnLoQ1" }. Add: { action_id: "purchase_streak", action_name: "Weekly purchase streak", coins: 100, type: "bonus", icon_emoji: "🔥", description: "Buy at least one card every week for 4 weeks" }. Keep all existing actions.

TASK 4 — Update @data/rewards/merchants.json:

Keep the same 12 merchants. No structural changes needed — this file just has display info.

TASK 5 — Rewrite @app/lib/rewards/data/rewardsMock.ts:

Replace all affiliate-based mock reward entries with coupon-cashback-based entries. Create entries for user_001 that reflect the new model:
- 2 entries with status "delivered" (recent card purchases with cashback pending confirmation)
- 2 entries with status "voucher_generated" (cards generated, awaiting delivery)
- 3 entries with status "redeemed" (confirmed cashback in pool) for Swiggy, Amazon, Flipkart — with user_share values of ₹10, ₹25, ₹15 (representing 2% cashback on ₹500, ₹1250, ₹750 face values)
- 2 entries with status "redeemed" that are platform_bonus type (streak bonus, signup bonus) — keep similar to current
- 1 entry with status "refunded" (an order that was refunded, cashback reversed)
Remove all references to click_id, network, gross_commission, platform_topup. Use order_id instead of click_id. Use reward_type "coupon_cashback" instead of "affiliate". Keep COMPUTED_CONFIRMED_BALANCE and COMPUTED_PENDING_BALANCE exports but recalculate them based on the new entries.

TASK 6 — Update @app/lib/rewards/data/userMock.ts:

Remove consent_affiliate_tracking and consent_granted_at from mockUserProfile. Add total_cards_purchased: 12. Keep all other fields the same.

After completing all tasks, run: npx tsc --noEmit
Fix any type errors before finishing.
```

---

## LAYER 2: Engine Files

**Paste this prompt into Claude Code:**

```
CONTEXT: I am migrating UnLoQ1 from affiliate rewards to coupon card rewards. Layer 1 (types + data) is complete. This is Layer 2 of 7 — rewriting the three engine files. Do NOT touch the store, API routes, components, or pages.

Read @app/lib/types.ts first to understand the new type definitions from Layer 1.

TASK 1 — Replace @app/lib/rewards/engine/clickHandler.ts with purchaseEngine.ts:

Delete clickHandler.ts entirely. Create a new file purchaseEngine.ts in the same directory.

This engine handles the coupon purchase flow. It should export these functions:

1. initiatePurchase(userId: string, itemId: string, paymentMethod: "upi" | "card" | "net_banking"): CouponOrder
   - Looks up the CatalogueItem by itemId from the catalogue (import couponCatalogue from ../data/couponCatalogue)
   - Throws if item not found or out of stock
   - Generates a unique order_id (crypto.randomUUID()) and idempotency_key
   - Creates a CouponOrder with payment_status "pending", voucher_status "pending_generation", voucher_code null
   - Stores in an in-memory orderStore array
   - Returns the CouponOrder

2. confirmPayment(orderId: string): CouponOrder
   - Finds order by order_id in orderStore
   - Sets payment_status to "confirmed", payment_confirmed_at to now
   - Calls generateVoucher internally
   - Returns updated order

3. generateVoucher(orderId: string): CouponOrder (internal, but exported for testing)
   - Finds order by order_id
   - Generates a mock voucher code: "UNLOQ1-" + merchant_id.toUpperCase() + "-" + random 6 alphanumeric chars
   - Sets voucher_status to "generated", voucher_code to the generated code, voucher_generated_at to now
   - Sets deep_link to "https://www." + merchant_id + ".com/redeem?code=" + voucher_code
   - Sets expiry_date to 6 months from now
   - Calls deliverVoucher internally
   - Returns updated order

4. deliverVoucher(orderId: string): CouponOrder (internal, but exported)
   - Sets voucher_status to "delivered", delivery_channel to "on_screen", delivered_at to now
   - Returns updated order

5. getOrderById(orderId: string): CouponOrder | null

6. getUserOrders(userId: string): CouponOrder[]
   - Returns all orders for user, sorted newest first

7. getOrderStore(): CouponOrder[] (for testing)

TASK 2 — Replace @app/lib/rewards/engine/routingEngine.ts with catalogueEngine.ts:

Delete routingEngine.ts entirely. Create catalogueEngine.ts in the same directory.

This engine handles catalogue browsing and merchant status. Export these functions:

1. getCatalogue(category?: MerchantCategory): CatalogueItem[]
   - Returns all items, optionally filtered by category
   - Sorted by merchant_display_name

2. getCatalogueItem(itemId: string): CatalogueItem | null

3. getMerchantDenominations(merchantId: string): CatalogueItem[]
   - Returns all denomination options for a given merchant

4. getMerchantStock(merchantId: string): "in_stock" | "out_of_stock"
   - Returns "in_stock" if ANY item for that merchant has in_stock: true

5. getAllMerchantsWithStatus(): MerchantWithStatus[]
   - Loads from merchants.json (same as old code) but uses getMerchantStock for status
   - Returns MerchantWithStatus[] with status as "in_stock" | "out_of_stock"

TASK 3 — Rewrite @app/lib/rewards/engine/rewardsLedger.ts:

Keep the overall structure but make these specific changes:

DELETE these functions entirely:
- creditToPool (postback commission crediting)
- getPostbackLog (postback audit trail)
- hasRecentPostbackActivity (postback activity check)

The postbackLog array and USER_SHARE_PCT constant should also be deleted.

ADD this new function:
- creditCashback(userId: string, orderId: string, merchantId: string, cashbackAmount: number): { entry: RewardEntry }
  - Creates a new RewardEntry with reward_type "coupon_cashback", status "redeemed" (cashback is instant), user_share = cashbackAmount, coins_credited = cashbackAmount * 10, order_id = orderId, merchant_id = merchantId
  - Appends to the ledger
  - Returns the entry

KEEP these functions (they work with the new model as-is, but update the internal references if RewardEntry fields changed):
- getPoolBalance (still sums confirmed entries — but now "redeemed" means pool-redeemed, and the new statuses for cashback entries use "redeemed" for confirmed cashback in pool)
- getRecentActivity
- getMonthlyEarnings
- getLifetimeStats
- redeemFromPool
- restoreRecentRedemption
- addPlatformBonus
- resetLedger

IMPORTANT: Update getPoolBalance to treat entries with status "redeemed" that have reward_type "coupon_cashback" or "platform_bonus" as confirmed pool balance (these are cashback credits). Entries with status "redeemed" that were redeemed FROM the pool (via redeemFromPool) should NOT count. To distinguish: redeemFromPool sets redeemed_at, so confirmed = entries where status is in the confirmed-like statuses AND redeemed_at is null. Actually, keep the existing logic — redeemFromPool already changes status to "redeemed" and sets redeemed_at for pool redemptions. For cashback credits, use status "confirmed" instead. Update creditCashback to use status "confirmed" (not "redeemed").

TASK 4 — Update @app/lib/rewards/index.ts barrel exports:

Replace the old exports with the new function names:
- Remove: merchantRoutes, getActiveRoutes, resolveRoute, handleMerchantClick, generateTrackedLink, getClickHistory, getClickStore, getClickById, creditToPool, getPostbackLog, hasRecentPostbackActivity
- Add: couponCatalogue (from data/couponCatalogue), getCatalogue, getCatalogueItem, getMerchantDenominations, getMerchantStock, getAllMerchantsWithStatus (from engine/catalogueEngine), initiatePurchase, confirmPayment, generateVoucher, deliverVoucher, getOrderById, getUserOrders, getOrderStore (from engine/purchaseEngine), creditCashback (from engine/rewardsLedger)
- Keep all other existing exports from rewardsLedger and data files

After completing all tasks, run: npx tsc --noEmit
Fix any type errors before finishing.
```

---

## LAYER 3: Zustand Store + API Routes

**Paste this prompt into Claude Code:**

```
CONTEXT: I am migrating UnLoQ1 from affiliate rewards to coupon card rewards. Layers 1-2 (types, data, engines) are complete. This is Layer 3 of 7 — rewriting the Zustand store and API routes. Do NOT touch components or pages.

Read @app/lib/types.ts and @app/lib/rewards/index.ts first to understand the available types and engine functions.

TASK 1 — Rewrite @app/lib/rewards/store.ts:

The store shape needs these changes:

REMOVE from state:
- consentGranted (boolean) — no longer needed
- handleShopClick action — replaced by purchaseCoupon
- grantConsent action — no longer needed

REMOVE the consentGranted line from refreshData (line: consentGranted: profileData?.data?.consent_affiliate_tracking ?? false)

ADD to state:
- catalogue: CatalogueItem[] (initialized to [])
- userOrders: CouponOrder[] (initialized to [])
- selectedMerchant: string | null (initialized to null)

ADD new actions:
- purchaseCoupon: (itemId: string, paymentMethod: "upi" | "card" | "net_banking") => Promise<{ success: boolean; order?: CouponOrder; message: string }>
  - Calls POST /api/rewards/purchase with { userId, itemId, paymentMethod }
  - On success, refreshes data and returns the order
  - On failure, returns error message

- fetchCatalogue: () => Promise<void>
  - Calls GET /api/rewards/catalogue
  - Sets catalogue in state

- fetchUserOrders: () => Promise<void>
  - Calls GET /api/rewards/my-cards?userId=user_001
  - Sets userOrders in state

- setSelectedMerchant: (merchantId: string | null) => void

UPDATE refreshData:
- Add catalogue and userOrders fetching (call /api/rewards/catalogue and /api/rewards/my-cards alongside existing calls)
- Remove consent_affiliate_tracking reference

KEEP these actions unchanged: redeemPool, restorePool, addBonus, updateLoanData, setAutoPrepayThreshold, toggleAutoPrepay

Update the EARN_ACTIONS array: add the two new actions from earn-actions.json (first_card_purchase and purchase_streak).

TASK 2 — DELETE @app/api/rewards/click/route.ts (affiliate click tracking — no longer needed)

TASK 3 — DELETE @app/api/rewards/postback/route.ts (affiliate postback listener — no longer needed)

TASK 4 — Create @app/api/rewards/catalogue/route.ts:
- GET handler that returns getCatalogue() from catalogueEngine
- Accept optional query param ?category=food to filter
- Response: { success: true, data: CatalogueItem[] }

TASK 5 — Create @app/api/rewards/purchase/route.ts:
- POST handler that accepts { userId, itemId, paymentMethod }
- Calls initiatePurchase from purchaseEngine
- Then calls confirmPayment (simulating instant payment for MVP)
- Then calls creditCashback from rewardsLedger with the order's cashback_amount
- Response: { success: true, data: { order: CouponOrder, cashbackCredited: number } }
- Error handling: return 400 with error message if item not found or out of stock

TASK 6 — Create @app/api/rewards/my-cards/route.ts:
- GET handler that accepts ?userId=user_001
- Calls getUserOrders from purchaseEngine
- Response: { success: true, data: CouponOrder[] }

TASK 7 — Update @app/api/rewards/merchants/route.ts:
- Change import from old routingEngine to new catalogueEngine
- Call getAllMerchantsWithStatus() from catalogueEngine instead of old function

TASK 8 — Update @app/api/rewards/profile/route.ts:
- Remove any references to consent_affiliate_tracking if present
- Ensure it works with the updated UserRewardsProfile type

TASK 9 — Update @app/api/rewards/ledger/route.ts:
- Should still work since getPoolBalance, getRecentActivity, getMonthlyEarnings, getLifetimeStats are kept
- Verify imports are correct

TASK 10 — Update @app/api/rewards/bonus/route.ts:
- Should still work since addPlatformBonus is kept
- Verify imports are correct

TASK 11 — Update @app/api/rewards/redeem/route.ts:
- Should still work since redeemFromPool and restoreRecentRedemption are kept
- Verify imports are correct

After completing all tasks, run: npx tsc --noEmit
Fix any type errors before finishing.
```

---

## LAYER 4: Components + Layout

**Paste this prompt into Claude Code:**

```
CONTEXT: I am migrating UnLoQ1 from affiliate rewards to coupon card rewards. Layers 1-3 (types, data, engines, store, APIs) are complete. This is Layer 4 of 7 — updating UI components and the rewards layout. Do NOT touch pages yet.

Read @app/lib/types.ts and @app/lib/rewards/store.ts to understand the current state shape.

TASK 1 — DELETE @app/components/rewards/ConsentModal.tsx
This component is no longer needed — the coupon card model doesn't require affiliate tracking consent.

TASK 2 — Update @app/components/rewards/index.ts barrel:
Remove the ConsentModal export line.

TASK 3 — Update @app/components/rewards/StatusBadge.tsx:
Replace the old status labels and colors with new ones:
- "ordered" → blue dot, label "Ordered"
- "payment_pending" → amber dot, label "Payment Pending"
- "payment_confirmed" → orange dot, label "Payment Confirmed"
- "voucher_generated" → teal dot, label "Voucher Ready"
- "delivered" → green dot, label "Delivered"
- "redeemed" → dark dot, label "Redeemed"
- "expired" → gray dot, label "Expired"
- "refunded" → red dot, label "Refunded"
- "confirmed" → green dot, label "Confirmed" (for cashback pool credits)
Keep the sm/md size variants.

TASK 4 — Update @app/components/rewards/MerchantStatusPill.tsx:
Change the prop and display:
- OLD: status: "active" | "inactive", showed "Rewards active" / "Check back soon"
- NEW: status: "in_stock" | "out_of_stock", show "Cards Available" with green animated ping dot for in_stock, "Out of Stock" with gray dot for out_of_stock

TASK 5 — Update @app/components/rewards/HeaderRewardsIndicator.tsx:
Remove the consentGranted reference if any. The component should still show TierBadge, pool balance, and StreakBadge. No major changes needed — just verify it works with the updated store (no consent field). Verify imports compile.

TASK 6 — Keep these components UNCHANGED (verify they compile):
- PoolBalanceDisplay.tsx
- TierBadge.tsx
- StreakBadge.tsx
- ComplianceFooter.tsx

TASK 7 — Update @app/rewards/layout.tsx:
Add a new "My Cards" tab to the tab navigation. The current tabs are: Overview, Earn, Pool, Redeem, Tiers. Change to: Overview, Shop Cards, My Cards, Pool, Redeem, Tiers. The "Shop Cards" tab links to /rewards/earn (same route, just renamed label). The "My Cards" tab links to /rewards/my-cards (new route).

After completing all tasks, run: npx tsc --noEmit
Fix any type errors before finishing.
```

---

## LAYER 5: UI Pages

**Paste this prompt into Claude Code:**

```
CONTEXT: I am migrating UnLoQ1 from affiliate rewards to coupon card rewards. Layers 1-4 are complete. This is Layer 5 of 7 — rewriting the rewards UI pages. The store, API routes, components, and types are all updated.

Read @app/lib/rewards/store.ts to understand the available state and actions. Read @app/lib/types.ts for CatalogueItem and CouponOrder types.

TASK 1 — Rewrite @app/rewards/earn/page.tsx as the Coupon Card Marketplace:

Replace the entire "Shop & Earn" affiliate merchant grid with a coupon card marketplace. Remove ALL references to ConsentModal, consentGranted, handleShopClick, and affiliate tracking.

New page structure:
- Page title: "Shop Coupon Cards" with subtitle "Buy discounted cards, earn cashback toward your home loan"
- Category filter pills at the top (All, Food, Grocery, Shopping, Fashion, Beauty, Electronics, Entertainment, Travel) — use the MerchantCategory type
- Card grid showing available coupon cards from the catalogue (use fetchCatalogue from store)
- Each card shows: merchant logo/icon, merchant name, denomination options as chips (e.g., ₹250, ₹500, ₹1000), discount percentage ("5% off"), cashback amount ("₹10 cashback to pool"), MerchantStatusPill for stock status
- Clicking a card opens a purchase modal showing: selected merchant + denomination, face value, discounted price, cashback amount, payment method selector (UPI/Card/Net Banking — just radio buttons for MVP), and a "Buy Now" button
- Buy Now calls purchaseCoupon from store
- Success state shows: confetti or checkmark animation, the voucher code with a copy button, a "Use in [Merchant]" deep link button, and "₹X cashback added to your pool!" message
- Keep the "Earn Bonus Coins" section at the bottom (the existing earn actions grid) — it still works

Use the existing brand colors from merchants.json for card accents. Use Framer Motion for animations (already a dependency). Use the same Tailwind styling patterns as the rest of the app (rounded-2xl cards, slate backgrounds, midnight blue accents).

TASK 2 — Create @app/rewards/my-cards/page.tsx (NEW PAGE):

This is a new page showing the user's purchased voucher cards.

Structure:
- Page title: "My Cards" with subtitle "Your purchased coupon cards"
- Filter tabs: All, Active, Redeemed, Expired
- Card list showing each purchased order (use fetchUserOrders from store)
- Each card shows: merchant name + icon, face value, voucher code (masked as "XXXX-XXXX" with a "Reveal" button that shows the full code), expiry date with countdown if < 30 days, StatusBadge showing voucher_status, copy code button, deep link "Use in [Merchant]" button
- Empty state: "No cards yet — head to Shop Cards to get started!" with a link to /rewards/earn

TASK 3 — Update @app/rewards/pool/page.tsx:

Remove any affiliate-specific references. Change the monthly earnings section header from mentioning "shopping rewards" or "affiliate" to "coupon cashback". The pool balance display, prepay modal, and auto-prepay settings should remain the same. Update the "How it works" or explanatory text to say earnings come from coupon card cashback instead of affiliate commissions.

TASK 4 — Update @app/rewards/redeem/page.tsx:

Remove the "Browse vouchers" card that showed Amazon/Flipkart/Swiggy/BookMyShow vouchers (this is now handled by the Shop Cards page). Focus this page on pool-to-prepayment redemption. Add a prominent "Use Pool Balance for Prepayment" card with the current confirmed balance and a "Prepay Now" button that links to /pay-now. Keep the existing layout style.

TASK 5 — Update @app/rewards/page.tsx (Dashboard/Overview):

Remove any affiliate-specific references in the recent activity feed. The activity entries now show coupon cashback instead of affiliate commissions. Update the activity feed item labels:
- For reward_type "coupon_cashback": show "Cashback from [merchant_name]"
- For reward_type "platform_bonus": show "Bonus: [campaign_ref readable]"
- Status badges should use the new StatusBadge statuses

Remove any reference to consentGranted or ConsentModal. The UNLOQ1 Score calculation should use hasRecentCouponPurchase instead of hasRecentPostbackCredit (update in the score computation section if it exists on this page).

Keep: pool balance display, coins display, lifetime prepaid, streak display, tier badge.

After completing all tasks, run: npx tsc --noEmit
Fix any type errors before finishing.
```

---

## LAYER 6: Integration Pages

**Paste this prompt into Claude Code:**

```
CONTEXT: I am migrating UnLoQ1 from affiliate rewards to coupon card rewards. Layers 1-5 are complete. This is Layer 6 of 7 — updating the non-rewards pages that integrate with the rewards system.

TASK 1 — Update @app/pay-now/page.tsx:

This page uses useRewardsStore for poolBalance, redeemPool, and restorePool. These store functions are unchanged, so the page should mostly work. Verify:
- Remove any references to consentGranted or handleShopClick if present
- The "Pay from Rewards Pool" card should still show confirmed pool balance and allow applying it to prepayment
- The restorePool on unmount should still work
- Run the TypeScript compiler to check for any type mismatches

TASK 2 — Update @app/lump-sum/page.tsx:

This page uses useRewardsStore for addBonus. Verify:
- The addBonus function is unchanged in the store
- The "Set Reminder" button that awards +25 bonus coins should still work
- Check for any imports from old engine files (clickHandler, routingEngine) and remove them
- Run the TypeScript compiler to check

TASK 3 — Update @app/monthly-extra/page.tsx:

Same as lump-sum — uses addBonus from the store. Verify:
- addBonus calls work correctly
- No stale imports from old engine files
- TypeScript compiles clean

After completing all tasks, run: npx tsc --noEmit
Fix any type errors before finishing.
```

---

## LAYER 7: Verification + Cleanup

**Paste this prompt into Claude Code:**

```
CONTEXT: I have completed the migration of UnLoQ1 from affiliate rewards to coupon card rewards (Layers 1-6). This is the final verification layer. Your job is to find and fix every remaining issue.

TASK 1 — Search for stale affiliate references across the entire codebase:

Run these searches and fix every match found:
- Search for "affiliate" in all .ts, .tsx, .json files (excluding node_modules, .next, .git)
- Search for "postback" in all .ts, .tsx files
- Search for "tracked_link" or "trackedLink" or "tracking_base_url"
- Search for "cuelinks" or "admitad" or "vcommission"
- Search for "clickHandler" or "click_handler" or "handleMerchantClick" or "handleShopClick"
- Search for "ClickEvent" (the deleted type)
- Search for "MerchantRoute" (the deleted type)
- Search for "PostbackEvent" or "PostbackStatus" or "PostbackLogEntry"
- Search for "consent_affiliate" or "consentGranted" or "grantConsent" or "ConsentModal"
- Search for "gross_commission" or "platform_topup"
- Search for "generateTrackedLink" or "getClickHistory" or "getClickStore" or "getClickById"
- Search for "creditToPool" (the old postback credit function — not creditCashback)
- Search for "getPostbackLog" or "hasRecentPostbackActivity"

For each match: if it's in a file that should have been updated, fix it. If it's in a comment explaining the old system, update the comment. If it's in a file that was supposed to be deleted, delete it.

TASK 2 — Verify deleted files are actually gone:
- app/lib/rewards/engine/clickHandler.ts should NOT exist (replaced by purchaseEngine.ts)
- app/lib/rewards/engine/routingEngine.ts should NOT exist (replaced by catalogueEngine.ts)
- app/lib/rewards/data/merchantRoutes.ts should NOT exist (replaced by couponCatalogue.ts)
- app/api/rewards/click/route.ts should NOT exist
- app/api/rewards/postback/route.ts should NOT exist
- app/components/rewards/ConsentModal.tsx should NOT exist

TASK 3 — Verify new files exist:
- app/lib/rewards/engine/purchaseEngine.ts
- app/lib/rewards/engine/catalogueEngine.ts
- app/lib/rewards/data/couponCatalogue.ts
- app/api/rewards/catalogue/route.ts
- app/api/rewards/purchase/route.ts
- app/api/rewards/my-cards/route.ts
- app/rewards/my-cards/page.tsx

TASK 4 — TypeScript compilation:
Run: npx tsc --noEmit
Fix ALL errors. Do not leave any type errors.

TASK 5 — Import graph check:
Verify that no file imports from deleted files. Specifically check:
- app/lib/rewards/index.ts — should export from new engine files, not old ones
- app/components/rewards/index.ts — should NOT export ConsentModal
- All API routes import from correct engine files

TASK 6 — Build test:
Run: npm run build
If the build fails, fix the errors. Common issues at this stage:
- Missing page exports (my-cards page needs "use client" and default export)
- Broken imports in layout.tsx
- Type mismatches between store and components

Report a summary of everything you found and fixed.
```

---

## Usage Instructions

1. Install Claude Code extension in Cursor (search "Claude Code" in Extensions)
2. Open the credx project folder in Cursor
3. Open Claude Code panel (Spark icon or Cmd+Shift+P → "Claude Code")
4. Set to **Plan mode** for Layer 1
5. Paste Layer 1 prompt, review the plan, approve
6. After Layer 1 completes, verify `npx tsc --noEmit` passes
7. Review the git diff: `git diff --stat`
8. If satisfied, commit: `git commit -am "Layer 1: Coupon card types and data"`
9. Repeat for Layers 2-7
10. After Layer 7, run `npm run build` for final verification

**Estimated time per layer:** 5-15 minutes depending on complexity. Total: ~1-1.5 hours with review time.
