# 🚀 StellarTrust: Test Day Runbook

This runbook guides testers, coordinators, and non-technical team members through conducting real user testing, collecting telemetry data, and packaging the final **StellarTrust** Green Belt submission.

---

## 📋 Table of Contents
1.  [Tester Onboarding Instructions](#1-tester-onboarding-instructions)
2.  [Wallet Setup Instructions](#2-wallet-setup-instructions)
3.  [Test Execution Order](#3-test-execution-order)
4.  [Required UI Screenshots](#4-required-ui-screenshots)
5.  [Required Analytics Captures](#5-required-analytics-captures)
6.  [Required Sentry Captures](#6-required-sentry-captures)
7.  [Required CSV Exports](#7-required-csv-exports)
8.  [Required Feedback Collection](#8-required-feedback-collection)
9.  [Demo Recording Sequence](#9-demo-recording-sequence)
10. [Final Submission Packaging Checklist](#10-final-submission-packaging-checklist)

---

## 👥 1. Tester Onboarding Instructions
To coordinate testing sessions:
1.  Assemble **10 distinct testers** (or open 10 separate accounts/profiles using browser extension wallets).
2.  Provide each tester with the URL of the deployed StellarTrust application.
3.  Assign specific roles to testers (e.g., Tester 1-5 act as **Clients**, Tester 6-10 act as **Freelancers**).
4.  Distribute this runbook and direct them to follow the steps sequentially.

---

## 🔑 2. Wallet Setup Instructions
Each tester must complete the following steps to configure their wallet:
1.  **Install Extension**: Download and install the [Freighter Wallet](https://www.freighter.app/) or [Albedo Wallet](https://albedo.link/) browser extension.
2.  **Create Account**: Set up a new wallet account and back up the recovery phrase safely.
3.  **Switch to Testnet**:
    *   Open the wallet settings/network menu.
    *   Change the network context from `Public/Mainnet` to **Testnet** (Test Stellar Network).
4.  **Fund Wallet**:
    *   Copy the wallet's public address (starting with `G`).
    *   Go to the [Stellar Laboratory Friendbot Faucet](https://laboratory.stellar.org/#account-creator?network=testnet).
    *   Paste the address and click **Get Test Funds**. Verify the wallet now has `10,000 XLM` of test tokens.

---

## 🏃 3. Test Execution Order

### Phase A: Wallet Connection & Registration (All Testers)
1.  Open the StellarTrust app.
2.  Make sure **Demo Mode** switch in the top header is toggled **OFF** (Live mode).
3.  Click **Connect Wallet** in the header, select your wallet, and approve the connection prompt.
4.  Navigate to the Dashboard / Settings, complete the onboarding profile (Username, Bio, Skills, Role), and click **Create Profile**. Approve the transaction in your browser wallet extension.

### Phase B: Escrow Creation & Funding (Client Testers)
1.  Go to the **Escrow Portal**.
2.  Fill out the contract creation form:
    *   Title & Description.
    *   Freelancer Wallet Address (copy from one of the Freelancer Testers).
    *   Milestone Count (select `2` milestones).
    *   Agreement Amount (e.g., `100 XLM`).
3.  Click **Create Agreement** and approve the transaction.
4.  On the agreement details page, click **Lock Funds** and approve the XLM transfer transaction to fund the escrow.

### Phase C: Acceptance & Milestone Submission (Freelancer Testers)
1.  Log in to the app. Check the active dashboard invitations list.
2.  Select the client's invitation, click **Accept Project**, and sign the transaction.
3.  Once accepted, complete the first milestone work, type a deliverable link or summary description, click **Submit Work**, and sign.

### Phase D: Approval, Release, and Reputation Review (Client Testers)
1.  Log in as the Client and navigate to the project details.
2.  Click **Approve Work** and sign the transaction.
3.  Click **Release Payout** and sign. The contract transfers 50% of the funds to the freelancer's wallet.
4.  *(Repeat submission & release steps for the final milestone. The contract sweeps the remaining balance, leaving 0 dust).*
5.  Once the status shifts to `Completed`, click **Submit Review**. Choose a rating (1-5 stars) and post your feedback comments, signing the transaction.

### Phase E: NFT Certification Minting (Freelancer Testers)
1.  Log in as the Freelancer. Go to the completed project card.
2.  Click **Mint Certificate** and sign.
3.  Go to **NFT Gallery** and confirm your completion badge loads.

---

## 📸 4. Required UI Screenshots
After completing the test cycles, take screenshots of the main routes and save them into `docs/screenshots/` (overwriting existing files):
*   `landing_desktop.png` & `landing_mobile.png`
*   `dashboard_desktop.png` & `dashboard_mobile.png`
*   `escrow_desktop.png` & `escrow_mobile.png`
*   `reputation_desktop.png` & `reputation_mobile.png`
*   `gallery_desktop.png` & `gallery_mobile.png`
*   `admin_desktop.png` & `admin_mobile.png`
*   `analytics_desktop.png` & `analytics_mobile.png`

---

## 📊 5. Required Analytics Captures
Verify event logging and capture dashboards:
1.  Log in to your [PostHog Console](https://app.posthog.com).
2.  Select your StellarTrust project. Go to the **Live Events** stream.
3.  Confirm events like `wallet_connected`, `profile_created`, `escrow_funded`, and `nft_minted` are listed.
4.  Capture a screenshot of the events feed chart and replace the text file placeholder at:
    `submission-proof/analytics/analytics-screenshot.png`

---

## 🛡️ 6. Required Sentry Captures
Verify error log diagnostics:
1.  Log in to your [Sentry Dashboard](https://sentry.io).
2.  Select the project issues stream page.
3.  Confirm client-side exceptions and warnings are tracked.
4.  Capture a screenshot of the active issues list and replace the text file placeholder at:
    `submission-proof/monitoring/sentry-screenshot.png`

---

## 🧾 7. Required CSV Exports
1.  Navigate to the **Green Belt Audit Board** (`/admin/validation`).
2.  Confirm that the Event log counts display **10+ distinct addresses** and 19+ logs.
3.  Click **Export CSV Audit Proof** in the header.
4.  The page triggers a browser download AND automatically saves the formatted telemetry proof directly to:
    `submission-proof/user-testing/10-user-wallet-proof.csv`

---

## 💬 8. Required Feedback Collection
1.  Direct all testers to navigate to the **Sandbox Testing Hub** (`/admin`).
2.  Fill in the **Real User Validation Program Form** (Category, Star rating, and feedback comment).
3.  Click **Submit Validator Report**. This automatically updates, aggregates, and saves the data directly to:
    `submission-proof/user-testing/feedback-summary.md`

---

## 🎬 9. Demo Recording Sequence
Record a 3-minute video showcase using a screen recorder (e.g. Loom, OBS):
1.  **Visual Introduction (30s)**: Start on the landing page, scrolling down to point out project details.
2.  **Wallet Connection & Settings (30s)**: Click Freighter connect and show the profile onboarding settings creation.
3.  **Client Escrow (1m)**: Form-fill a milestone agreement, click create, show Freighter authorization popup window, and click lock funds.
4.  **Freelancer Milestone (30s)**: Show project acceptance, work submission, client milestone approval, and payout release.
5.  **Certification Badge (30s)**: Mint the project badge NFT, show the visual card rendering in the gallery, and view the updated trust score.
6.  **Upload**: Publish to YouTube/Loom and paste the link inside:
    `submission-proof/demo/demo-video-link.md`

---

## 📦 10. Final Submission Packaging Checklist
Review before pushing your final commit to GitHub:
- [ ] Deployed Contract IDs in `contract-addresses.md` match active deployments.
- [ ] User testing proof CSV file (`10-user-wallet-proof.csv`) is populated with 10+ user address rows.
- [ ] Feedback summary MD file (`feedback-summary.md`) contains tester comments.
- [ ] PostHog screenshot image replaces the `analytics-screenshot.png` placeholder.
- [ ] Sentry screenshot image replaces the `sentry-screenshot.png` placeholder.
- [ ] Presentation recording URL is added to `demo-video-link.md`.
- [ ] Standalone scripts `verify-analytics.js` and `verify-monitoring.js` run successfully.
- [ ] Master Judge Index file (`JUDGE_INDEX.md`) is verified.
- [ ] Next.js project is fully deployed to Vercel production hosting.
- [ ] Run `git push origin main` to deploy.
