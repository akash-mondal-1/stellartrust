# StellarTrust Green Belt Production Status

This document lists the production readiness and classification of every feature in StellarTrust. There are no simulation layers or local simulations active when live wallet mode is engaged.

---

## 📊 Feature Classification Matrix

| Feature / UI Action | Core Mechanism | Status Classification | Transaction Hash Source | Backend Persistence |
| :--- | :--- | :--- | :--- | :--- |
| **Connect Wallet** | Freighter Extension API | **REAL TESTNET** | N/A (Connection Only) | Local Browser State |
| **Create Profile** | Identity Contract (`register_user` / `update_profile`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Verify Profile** | Next.js API Route + Admin Signature + Identity Contract (`verify_user`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Create Agreement** | Escrow Contract (`create_agreement`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Fund Escrow** | Escrow Contract (`fund_escrow`) + XLM native token transfer authorization | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Accept Agreement** | Escrow Contract (`accept_agreement`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Submit Work** | Escrow Contract (`submit_work`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Approve Work** | Escrow Contract (`approve_work`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Release Payment** | Escrow Contract (`release_payment`) + XLM native token payout | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Raise Dispute** | Escrow Contract (`raise_dispute`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Refund Client** | Escrow Contract (`refund_client`) + XLM native token return | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Submit Review** | Reputation Contract (`add_review`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Mint NFT Badge** | Next.js API Route + Admin Signature + Achievement NFT Contract (`mint_project_nft`) | **REAL TESTNET** | Real Stellar Transaction Hash | Stellar Ledger persistent storage |
| **Analytics & Logs** | Local Storage Activity Logging + Supabase Analytics tracking | **SUPABASE / LOCAL STORAGE** | N/A | Supabase PostgreSQL Database |

---

## 🔍 Brutally Honest Validation Notes

* **Freighter Signature Popups:** Every write action listed under **REAL TESTNET** pops up the Freighter browser extension, requesting the user's password and approval (and displaying the exact token allowance details during the `fund_escrow` invocation).
* **Transaction Hash Source:** All transaction hashes displayed in the client dashboard correspond to valid transaction records mined on the Stellar Testnet ledger and can be immediately checked on `Stellar.Expert`.
* **Admin Signature Delegation:** Profile KYC verification and NFT minting call the Next.js API router. The router delegates transaction building and signature generation to the deployed admin address (`GDXFP76X2XVYSQAQTAPY3QTDWVJYEW732A6RDJOGUUAEVNPQHBC3LSX4`), which is executed securely without exposing secret keys to the browser.
