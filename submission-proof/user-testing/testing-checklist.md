# 🧪 User Testing & Validation Checklist

This checklist guides manual user testing sessions to collect real wallet interaction logs for Green Belt verification.

---

## 🗂️ Pre-Test Requirements
- [ ] Install **Freighter** or **Albedo** wallet extension in the browser.
- [ ] Set the network context inside the wallet settings to **Stellar Testnet**.
- [ ] Connect to the Friendbot faucet and receive Testnet XLM to cover fee gas and escrow locks.
- [ ] Open the StellarTrust live application link.

---

## 🏃 Step-by-Step Test Scenarios

### Test 1: Wallet Connection & Authentication
- [ ] Click the **Connect Wallet** button in the header.
- [ ] Select the installed wallet type (e.g., Freighter).
- [ ] Approve the wallet connection request prompt.
- [ ] Verify that the header displays the truncated wallet address and the connection indicator turns green.

### Test 2: User Onboarding & Profile Registry
- [ ] Access the **Dashboard** or **Settings** tab.
- [ ] Complete the Profile wizard by filling in:
    *   Username handle (must be unique).
    *   Skills tags.
    *   Bio overview.
    *   Role preference (Client / Freelancer / Both).
- [ ] Click **Create Profile** to trigger the wallet transaction.
- [ ] Approve the `register_user` Soroban contract invocation transaction in the wallet.
- [ ] Verify that the dashboard profile loads the newly registered data.

### Test 3: Agreement Creation & Escrow Lockup (Client Flow)
- [ ] Navigate to the **Escrow Portal**.
- [ ] Fill out the creation form:
    *   Project Title & Description.
    *   Freelancer Wallet Address.
    *   Milestone Count (e.g., 2).
    *   Escrow Budget amount in XLM.
- [ ] Click **Create Agreement**.
- [ ] Approve the `create_agreement` transaction.
- [ ] Navigate to the agreement detail screen and click **Lock Funds**.
- [ ] Verify and approve the transfer of XLM to the Escrow Contract address.
- [ ] Verify that the status updates to `Funded`.

### Test 4: Project Acceptance & Milestone Submission (Freelancer Flow)
- [ ] Log in with the Freelancer wallet address.
- [ ] Open the dashboard and check the **Invitations** list.
- [ ] Select the funded project agreement and click **Accept Project**.
- [ ] Approve the `accept_agreement` transaction.
- [ ] Complete the work for Milestone 1 and click **Submit Deliverable**.
- [ ] Approve the `submit_work` transaction.
- [ ] Verify that the agreement status shifts to `Submitted`.

### Test 5: Approval & Release (Client Flow)
- [ ] Log back in with the Client wallet address.
- [ ] Open the active agreement details.
- [ ] Review the submission deliverables and click **Approve Milestone**.
- [ ] Approve the `approve_work` transaction.
- [ ] Click **Release Payout** to trigger milestone distribution.
- [ ] Approve the `release_payment` transaction.
- [ ] Verify that the freelancer receives the milestone funds and the project advances.

### Test 6: Reputation Feedback & NFT Certificate Generation
- [ ] After all milestones are completed, the client clicks **Submit Feedback**.
- [ ] Input a rating (1 to 5) and project comment, then click **Post Review**.
- [ ] Approve the `add_review` transaction.
- [ ] Check the Freelancer's **Reputation Score** to ensure it dynamically updates.
- [ ] Select the completed project and click **Mint Certificate**.
- [ ] Approve the `mint_project_nft` transaction.
- [ ] Access the **NFT Gallery** and confirm that the virtual SVG achievement badge loads containing correct metadata.
