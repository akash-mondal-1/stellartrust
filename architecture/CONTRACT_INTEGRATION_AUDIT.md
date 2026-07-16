# StellarTrust Smart Contract Integration Audit

**Date:** June 17, 2026  
**Auditor Role:** Senior Soroban Smart Contract Auditor & Full Stack Engineer  
**System Evaluated:** StellarTrust Web Platform and Rust Soroban Contracts

---

## Executive Summary

This audit reviews the integration between the Next.js frontend application and the deployed Soroban smart contracts on the Stellar Testnet.

**Critical Findings:** While the smart contracts (`identity`, `escrow`, `reputation`, and `nft`) are fully written in Rust and deployable to Stellar Testnet, the frontend application is running entirely on a local storage-backed **Mock Database simulation layer** (`MockDatabase` in `apps/web/src/lib/supabase.ts` and `apps/web/src/hooks/useStellar.tsx`).

Only **Wallet Connection** triggers the Freighter extension popup to request access. All subsequent transactions (escrow funding, milestone releases, reputation rating submission, and NFT minting) are processed in simulated local browser state without triggering Freighter signatures or posting transactions to the Stellar network.

---

## Phase 1: Contract Integration Matrix

| UI Action / Feature | Hook Function Called | API / RPC Call | Mock Storage Used? | Supabase Used? | Deployed Soroban Contract Used? | Transaction Signed? | Tx Hash Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Connect Wallet** | `connectWallet` | `@stellar/freighter-api` | Yes (stores address) | No | No | No (Connection only) | None |
| **Create Profile** | `registerProfile` | None | Yes (local profiles) | No | No | No | None |
| **Verify Profile** | `verifyProfile` | None | Yes (local profiles) | No | No | No | None |
| **Create Agreement** | `createAgreement` | None | Yes (local agreements) | No | No | No | None |
| **Fund Escrow** | `fundEscrow` | None | Yes (updates status) | No | No | No | Mock random hex string |
| **Accept Agreement** | `acceptAgreement` | None | Yes (updates status) | No | No | No | None |
| **Submit Work** | `submitWork` | None | Yes (updates status) | No | No | No | None |
| **Approve Work** | `approveWork` | None | Yes (updates status) | No | No | No | None |
| **Release Payment** | `releasePayment` | None | Yes (updates status) | No | No | No | None |
| **Raise Dispute** | `raiseDispute` | None | Yes (updates status) | No | No | No | None |
| **Refund Client** | `refundClient` | None | Yes (updates status) | No | No | No | None |
| **Submit Review** | `submitReview` | None | Yes (local reviews) | No | No | No | None |
| **Mint Achievement NFT** | `mintNFT` | None | Yes (local NFTs) | No | No | No | Mock project hash string |

---

## Phase 2: Escrow Workflow Audit Details

### 1. Create Agreement

- **Trigger:** "Initialize On-Chain Escrow" button submit in `/escrow`.
- **Status:** **MOCK IMPLEMENTATION**.
- **Explanation:** The agreement metadata is appended to `localStorage` under `stellar_trust_agreements`. No transaction is built, signed, or submitted to the Stellar network.

### 2. Fund Escrow

- **Trigger:** "Fund Escrow Payouts" button click in `/escrow?id=...`.
- **Status:** **MOCK IMPLEMENTATION**.
- **Explanation:** Status changes to `Funded` locally, and a fake transaction hash is generated on-the-fly (`'0x' + Math.random().toString(16)`). No XLM is transferred on Testnet, and the Freighter popup is not shown.

### 3. Complete Milestone

- **Trigger:** "Submit Milestone Work" and "Approve Deliverables" button clicks.
- **Status:** **MOCK IMPLEMENTATION**.
- **Explanation:** The state updates inside browser memory/localStorage, but no Soroban contract states are modified on-chain.

### 4. Release Payment

- **Trigger:** "Release Milestone Payment" button click.
- **Status:** **MOCK IMPLEMENTATION**.
- **Explanation:** The funds are theoretically sent to the freelancer's wallet balance, but no actual on-chain transaction is built or signed.

---

## Phase 3: Reputation Workflow Audit

- **Contract Capabilities:** Yes, the Reputation contract (`contracts/reputation/src/lib.rs`) defines an `add_review` method that updates the target address's rating count, sum, and trust score, and emits a `review` event.
- **Frontend State:** **MOCK IMPLEMENTATION**.
- **Explanation:** The UI allows input of reviews and star ratings, but submits them directly to the `mockDb` using the local function `submitReview()`. The Reputation smart contract is never invoked, meaning the rating scores shown on `/reputation` are fully simulated in local storage.

---

## Phase 4: NFT Certificate Workflow Audit

- **Contract Capabilities:** Yes, the Achievement NFT contract (`contracts/nft/src/lib.rs`) defines a `mint_project_nft` method that increments the token ID, registers metadata (project name, project hash, deadline), and stores the record on-chain.
- **Frontend State:** **MOCK IMPLEMENTATION**.
- **Explanation:** The UI displays minted certificates and has a "Claim & Mint NFT" button, but it writes directly to `localStorage.stellar_trust_nft_${address}` using the local `mintNFT()` function. No transaction is signed, no mint occurs on Testnet, and the link to Stellar.Expert uses the mock generated deliverable hash.

---

## Final Recommendation

To graduate this project from a sandbox simulation to a true Web3 production-ready application, the simulated methods in `useStellar.tsx` must be refactored to construct real Stellar transaction envelopes, request signature authorization via Freighter, and broadcast the transaction envelopes to the Stellar Testnet RPC.
