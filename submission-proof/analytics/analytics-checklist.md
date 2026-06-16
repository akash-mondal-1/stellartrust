# 📈 PostHog Analytics Integration Checklist

This checklist verifies the initialization and firing of PostHog analytics tracking during user interactions.

---

## ⚙️ Setup & Initialization Check
- [ ] Verify `NEXT_PUBLIC_POSTHOG_KEY` is injected into the production environment.
- [ ] Confirm `NEXT_PUBLIC_POSTHOG_HOST` matches `https://app.posthog.com` or custom proxy.
- [ ] Validate that the PostHog provider is wrapped correctly around the root layout in `apps/web/src/app/layout.tsx`.
- [ ] Check browser console outputs during initial load; confirm no initialization exceptions are thrown.

---

## 🎯 Event Triggers Verification
Perform actions in the app and verify they capture in the browser developer tools network logs (filtering by `posthog.com/e/` or `/decide/` payloads) and on the PostHog live events dashboard:

### 1. `wallet_connected` Event
- [ ] Trigger: Connect Freighter/Albedo wallet.
- [ ] Payload Checks: Verify it passes `wallet_type` (e.g., freighter) and `mode` (demo/live).

### 2. `profile_created` Event
- [ ] Trigger: Complete profile registration wizard.
- [ ] Payload Checks: Verify it contains `username` and `role`.

### 3. `escrow_created` Event
- [ ] Trigger: Create a new work agreement form.
- [ ] Payload Checks: Verify details map `agreement_id`, `amount`, and `title`.

### 4. `escrow_funded` Event
- [ ] Trigger: Client funds the created escrow.
- [ ] Payload Checks: Verify `agreement_id` is tracked.

### 5. `milestone_completed` Event
- [ ] Trigger: Client approves and releases a milestone payout.
- [ ] Payload Checks: Confirm `agreement_id`, `all_released` status, and current project status map.

### 6. `reputation_updated` Event
- [ ] Trigger: Submit a review and rating.
- [ ] Payload Checks: Confirm `agreement_id`, rating score (1-5), and target address are mapped.

### 7. `nft_minted` Event
- [ ] Trigger: Mint the completion badge.
- [ ] Payload Checks: Verify `agreement_id` and project name are logged.
