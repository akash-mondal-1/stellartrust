# 📦 StellarTrust Green Belt Evidence Package

This directory serves as the official **Evidence Package** for the submission of **StellarTrust** to the Stellar Green Belt competition. It compiles verified deployment information, system validation architectures, analytics configurations, monitoring states, and user testing logs.

StellarTrust is a decentralized freelance escrow and reputation protocol built on Stellar Soroban Smart Contracts, Next.js, and Supabase.

---

## 📂 Evidence Directory Structure

*   **[`contract-addresses.md`](file:///d:/StellarFlow%204/submission-proof/contract-addresses.md)**: Catalog of deployed contract IDs on Stellar Testnet.
*   **[`deployment-transactions.md`](file:///d:/StellarFlow%204/submission-proof/deployment-transactions.md)**: On-chain transaction details for the contract deployments.
*   **[`user-testing/`](file:///d:/StellarFlow%204/submission-proof/user-testing/)**:
    *   [`testing-checklist.md`](file:///d:/StellarFlow%204/submission-proof/user-testing/testing-checklist.md): User acceptance test script.
    *   [`10-user-wallet-proof.csv`](file:///d:/StellarFlow%204/submission-proof/user-testing/10-user-wallet-proof.csv): Proof of 10+ distinct wallet interactions (header-only template for live testing).
    *   [`feedback-summary.md`](file:///d:/StellarFlow%204/submission-proof/user-testing/feedback-summary.md): Summary report structure for collected user testers feedback.
*   **[`analytics/`](file:///d:/StellarFlow%204/submission-proof/analytics/)**:
    *   [`analytics-checklist.md`](file:///d:/StellarFlow%204/submission-proof/analytics/analytics-checklist.md): Integration validation checklist for PostHog event streams.
    *   [`analytics-events.md`](file:///d:/StellarFlow%204/submission-proof/analytics/analytics-events.md): Specification of the 7 tracked analytics events.
    *   [`analytics-notes.md`](file:///d:/StellarFlow%204/submission-proof/analytics/analytics-notes.md): Notes on PostHog dashboard configuration and telemetry setup.
    *   [`analytics-screenshot.png`](file:///d:/StellarFlow%204/submission-proof/analytics/analytics-screenshot.png): Placeholder for PostHog metrics dashboard capture.
*   **[`monitoring/`](file:///d:/StellarFlow%204/submission-proof/monitoring/)**:
    *   [`sentry-checklist.md`](file:///d:/StellarFlow%204/submission-proof/monitoring/sentry-checklist.md): Sentry crash reporting checklist.
    *   [`monitoring-notes.md`](file:///d:/StellarFlow%204/submission-proof/monitoring/monitoring-notes.md): Error tracking architecture overview.
    *   [`sentry-screenshot.png`](file:///d:/StellarFlow%204/submission-proof/monitoring/sentry-screenshot.png): Placeholder for Sentry issues stream capture.
*   **[`screenshots/`](file:///d:/StellarFlow%204/submission-proof/screenshots/)**:
    *   `desktop/` & `mobile/`: Automated and manual screen capture assets.
    *   [`screenshots-index.md`](file:///d:/StellarFlow%204/submission-proof/screenshots/screenshots-index.md): Markdown index cataloging desktop and mobile app screens.
*   **[`deployment/`](file:///d:/StellarFlow%204/submission-proof/deployment/)**:
    *   [`deployment-summary.md`](file:///d:/StellarFlow%204/submission-proof/deployment/deployment-summary.md): Summary of deployment configurations, dates, and network params.
    *   [`environment-checklist.md`](file:///d:/StellarFlow%204/submission-proof/deployment/environment-checklist.md): Environment keys configuration validation checklist.
    *   [`deployment-evidence.md`](file:///d:/StellarFlow%204/submission-proof/deployment/deployment-evidence.md): On-chain build log verification instructions.
*   **[`demo/`](file:///d:/StellarFlow%204/submission-proof/demo/)**:
    *   [`demo-video-link.md`](file:///d:/StellarFlow%204/submission-proof/demo/demo-video-link.md): Video link placeholder.
    *   [`demo-script.md`](file:///d:/StellarFlow%204/submission-proof/demo/demo-script.md): Complete narrated step script for video recording.
    *   [`recording-checklist.md`](file:///d:/StellarFlow%204/submission-proof/demo/recording-checklist.md): Audio-visual requirements checklists.

---

## 🏆 Green Belt Guidelines Alignment
This evidence package is designed to provide judges with unambiguous proof that StellarTrust:
1.  Is fully deployed on Stellar Testnet with correct source verification.
2.  Provides standard wallet compatibility (Freighter/Albedo).
3.  Implements analytics (PostHog) and monitoring (Sentry) services.
4.  Possesses visual consistency and responsiveness across device form factors.
5.  Is verified by real users via transparent ledger sessions.
