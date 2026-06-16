# 📋 Real User Testing Execution Checklist

This checklist tracks the real on-chain interactions and system verifications required to finalize the **StellarTrust** Green Belt evidence package.

---

## 👥 1. User Wallet Interactions (On-Chain)

### Wallet Connections (Target: 10)
- [ ] Wallet Connection 1 Address: `________________________________________`
- [ ] Wallet Connection 2 Address: `________________________________________`
- [ ] Wallet Connection 3 Address: `________________________________________`
- [ ] Wallet Connection 4 Address: `________________________________________`
- [ ] Wallet Connection 5 Address: `________________________________________`
- [ ] Wallet Connection 6 Address: `________________________________________`
- [ ] Wallet Connection 7 Address: `________________________________________`
- [ ] Wallet Connection 8 Address: `________________________________________`
- [ ] Wallet Connection 9 Address: `________________________________________`
- [ ] Wallet Connection 10 Address: `_______________________________________`

### Profile Creations (Target: 5)
- [ ] Profile 1 Username: `________` | Address: `____________________` | Tx Hash: `________`
- [ ] Profile 2 Username: `________` | Address: `____________________` | Tx Hash: `________`
- [ ] Profile 3 Username: `________` | Address: `____________________` | Tx Hash: `________`
- [ ] Profile 4 Username: `________` | Address: `____________________` | Tx Hash: `________`
- [ ] Profile 5 Username: `________` | Address: `____________________` | Tx Hash: `________`

### Escrow Creations (Target: 5)
- [ ] Escrow 1 Client: `____` | Freelancer: `____` | Amount: `____` | Tx Hash: `________`
- [ ] Escrow 2 Client: `____` | Freelancer: `____` | Amount: `____` | Tx Hash: `________`
- [ ] Escrow 3 Client: `____` | Freelancer: `____` | Amount: `____` | Tx Hash: `________`
- [ ] Escrow 4 Client: `____` | Freelancer: `____` | Amount: `____` | Tx Hash: `________`
- [ ] Escrow 5 Client: `____` | Freelancer: `____` | Amount: `____` | Tx Hash: `________`

### Escrow Funding Transactions (Target: 5)
- [ ] Escrow Funding 1 Tx Hash: `________________________________________________________________`
- [ ] Escrow Funding 2 Tx Hash: `________________________________________________________________`
- [ ] Escrow Funding 3 Tx Hash: `________________________________________________________________`
- [ ] Escrow Funding 4 Tx Hash: `________________________________________________________________`
- [ ] Escrow Funding 5 Tx Hash: `________________________________________________________________`

### Milestone Completions (Target: 5)
- [ ] Milestone 1 Release Tx Hash: `________________________________________________________________`
- [ ] Milestone 2 Release Tx Hash: `________________________________________________________________`
- [ ] Milestone 3 Release Tx Hash: `________________________________________________________________`
- [ ] Milestone 4 Release Tx Hash: `________________________________________________________________`
- [ ] Milestone 5 Release Tx Hash: `________________________________________________________________`

### On-Chain Reputation Updates (Target: 5)
- [ ] Review & Score Update 1 Tx Hash: `________________________________________________________________`
- [ ] Review & Score Update 2 Tx Hash: `________________________________________________________________`
- [ ] Review & Score Update 3 Tx Hash: `________________________________________________________________`
- [ ] Review & Score Update 4 Tx Hash: `________________________________________________________________`
- [ ] Review & Score Update 5 Tx Hash: `________________________________________________________________`

### NFT Badge Mints (Target: 5)
- [ ] Achievement NFT 1 Mint Tx Hash: `________________________________________________________________`
- [ ] Achievement NFT 2 Mint Tx Hash: `________________________________________________________________`
- [ ] Achievement NFT 3 Mint Tx Hash: `________________________________________________________________`
- [ ] Achievement NFT 4 Mint Tx Hash: `________________________________________________________________`
- [ ] Achievement NFT 5 Mint Tx Hash: `________________________________________________________________`

---

## 🛠️ 2. Platform Integrations Verification

### Analytics Verification (PostHog)
- [ ] Verify that all 7 event types (`wallet_connected`, `profile_created`, `escrow_created`, `escrow_funded`, `milestone_completed`, `reputation_updated`, `nft_minted`) fire.
- [ ] Verify that properties (address, role, amounts) map correctly.
- [ ] Save dashboard screenshot to `submission-proof/analytics/analytics-screenshot.png`.

### Sentry Verification
- [ ] Trigger a mock exception and confirm ingestion on Sentry.
- [ ] Check client environment tags.
- [ ] Save issues stream screenshot to `submission-proof/monitoring/sentry-screenshot.png`.

### Smart Contract Verification
- [ ] Verify local WASM file hashes match on-chain `wasm_hash` records.
- [ ] Check method signature specs via Stellar CLI.

---

## 📱 3. Device & UI Verification
- [ ] **Desktop Viewport Verification**: Visually check layout grids and components (1280x800).
- [ ] **Mobile Viewport Verification**: Visually check Tailwind layouts and header toggles on screen sizing (375x812).

---

## 📹 4. Pitch & Demo Verification
- [ ] Verify voiceover audio levels.
- [ ] Confirm video runs cleanly at 1080p.
- [ ] Verify Freighter interaction prompts are visible.
- [ ] Save link in `submission-proof/demo/demo-video-link.md`.
