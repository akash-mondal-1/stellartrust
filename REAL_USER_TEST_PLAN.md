# StellarTrust Real User Validation Test Plan

This test plan defines the procedure to validate StellarTrust on the Stellar Testnet with a cohort of **15+ active wallet users**.

---

## 👥 Cohort Setup & Prerequisites

1. **Wallet Requirement:** All 15+ testers must install the **Freighter Wallet** extension (or compatible xBull wallet).
2. **Network Configuration:** Testers must ensure their Freighter wallet is configured to the **Stellar Testnet** network.
3. **Faucet Funding:** Each tester must faucet their account address to obtain testnet XLM.
   * *Direct Link:* [Stellar Laboratory Friendbot Faucet](https://laboratory.stellar.org/#account-creator?network=testnet)
   * Or click the Friendbot faucet link in their Freighter wallet.

---

## 🚀 Step-by-Step Testing Checklist

Testers will act in pairs: one as the **Client** and one as the **Freelancer**.

### 1. Account & Connection Validation

* [ ] Connect Freighter wallet to StellarTrust.
* [ ] Disable "Demo Mode" in the dashboard header.
* [ ] Verify the Freighter popup triggers requesting account access.
* [ ] Navigate to **Settings** -> Fill in username, bio, skills -> Click **Save Profile Details** -> Approve transaction in Freighter -> Wait for ledger confirmation.
* [ ] Navigate to **KYC Verification** in Settings -> Click **Verify Identity** -> Verify success and on-chain verified status badge.

### 2. Trustless Escrow Flow (Client & Freelancer Pair)

* [ ] **Client:** Navigate to **Escrow** -> Click **Initialize On-Chain Escrow** -> Input Freelancer's real Testnet public key, title, milestones, amount, and deadline -> Click **Submit** -> Sign with Freighter.
* [ ] **Client:** Find the created agreement under "My Escrows" -> Click **Fund Escrow Payouts** -> Confirm the XLM transfer allowance popup in Freighter -> Verify status changes to **Funded**.
* [ ] **Freelancer:** Log in -> Locate the shared agreement under "My Escrows" -> Click **Accept Project** -> Sign with Freighter.
* [ ] **Freelancer:** Once work is done, click **Submit Work** -> Sign with Freighter -> Verify milestone status is updated.
* [ ] **Client:** Navigate to the agreement -> Click **Approve Work** -> Sign with Freighter.
* [ ] **Client:** Click **Release Payment** -> Sign with Freighter -> Verify XLM tokens are transferred from the contract to the Freelancer's wallet balance.

### 3. Reputation & Certificate Loop

* [ ] **Client:** Once the escrow is fully released, click **Write Review** -> Enter star rating and comment -> Click **Submit Review** -> Sign with Freighter.
* [ ] **Freelancer:** Refresh Settings/Dashboard -> Verify updated Trust Score and Average Rating in the header.
* [ ] **Freelancer:** Navigate to **NFT Gallery / Certificates** -> Find the completed project -> Click **Claim & Mint NFT Certificate** -> Confirm minting status.
* [ ] **Freelancer:** Verify that the newly minted certificate displays on the dashboard profile.

---

## 📈 Capture & Validation Monitoring

During the test day, coordinates must monitor the following capture systems:

1. **Wallet Connection Tracking:**
   * Navigate to the StellarTrust Admin Dashboard `/admin/validation` or `/admin/submission`.
   * Verify all 15+ unique public keys are registered.
2. **Transaction Logging:**
   * Locate the activity logs list.
   * Verify that each on-chain step displays a valid transaction hash that links directly to the `Stellar.Expert` blockchain explorer.
3. **Analytics Capture:**
   * Confirm event metrics are logged to the analytics console for events: `wallet_connected`, `profile_created`, `escrow_created`, `escrow_funded`, `milestone_completed`, `reputation_updated`, and `nft_minted`.
4. **Feedback Collection:**
   * Instruct testers to submit UX feedback via the platform's support form to verify database capture.
