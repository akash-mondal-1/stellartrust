# StellarTrust Real Soroban Integration Roadmap

This document outlines the priority-based integration path for migrating StellarTrust from simulated states to real on-chain interactions on Stellar Testnet.

---

## 🗺️ Integration Priorities

### 🥇 Priority 1: Identity & Profiles (Identity Contract)

Establishes the foundation of the platform by linking Stellar public keys to user details.

* **Files to Modify:**
  * [useStellar.tsx](file:///d:/StellarFlow%204/apps/web/src/hooks/useStellar.tsx)
  * [stellar.ts](file:///d:/StellarFlow%204/apps/web/src/lib/stellar.ts) (New Helper)
  * `/api/verify-profile/route.ts` (New Route)
* **Frontend Work:**
  * Wire up "Save Profile Details" form to build and sign `register_user` transaction.
  * Hook up "Verify Identity Now" button to call the secure backend admin verify endpoint.
  * Replace initial state loading with read-only simulation queries (`get_profile`).
* **Soroban SDK Work:**
  * Encode `UserProfile` struct arguments and parse returned struct XDR into JavaScript JSON.
* **Testing Effort:** Low-Medium. Query user profiles and verify identity updates.
* **Implementation Risk:** Low. No token movement involved.

---

### 🥈 Priority 2: Trustless Escrow & Milestones (Escrow Contract)

The core value proposition of StellarTrust: locking funds and releasing them upon work approval.

* **Files to Modify:**
  * [useStellar.tsx](file:///d:/StellarFlow%204/apps/web/src/hooks/useStellar.tsx)
* **Frontend Work:**
  * Refactor "Initialize On-Chain Escrow" -> calls `create_agreement` on-chain.
  * Refactor "Fund Escrow Payouts" -> calls `fund_escrow` (Freighter pops up with XLM transfer authorization).
  * Refactor accept, submit, approve, and release milestone actions -> call corresponding contract methods on-chain.
* **Soroban SDK Work:**
  * Convert decimal amounts into stroops (`i128`) using `ScInt`.
  * Handle nested sub-call authorizations for native token transfer.
* **Testing Effort:** High. Must verify status transitions (Created -> Funded -> Accepted -> Submitted -> Approved -> Released).
* **Implementation Risk:** High. Involves real Testnet XLM token transfers and contract-held balances.

---

### 🥉 Priority 3: On-Chain Reputation Loop (Reputation Contract)

Binds ratings and reviews to the blockchain, modifying user trust scores dynamically.

* **Files to Modify:**
  * [useStellar.tsx](file:///d:/StellarFlow%204/apps/web/src/hooks/useStellar.tsx)
* **Frontend Work:**
  * Refactor review submission to invoke `add_review` on the Reputation contract.
  * Query and display the real-time trust score on profiles using the `get_reputation` simulation.
* **Soroban SDK Work:**
  * Encode string reviews and rating `u32` variables.
* **Testing Effort:** Medium. Verify score calculations are updated on the blockchain.
* **Implementation Risk:** Low-Medium. Requires prior escrow agreement completion context.

---

### 🏅 Priority 4: Achievement Certificates (Achievement NFT Contract)

Mints verifiable digital badges to freelancers upon project completion.

* **Files to Modify:**
  * [useStellar.tsx](file:///d:/StellarFlow%204/apps/web/src/hooks/useStellar.tsx)
  * `/api/mint-nft/route.ts` (New Route)
* **Frontend Work:**
  * Refactor "Claim & Mint NFT" -> calls the backend secure minting endpoint.
  * Query user balance of NFT certificates using simulations.
* **Soroban SDK Work:**
  * Construct metadata struct containing project details.
* **Testing Effort:** Medium. Verify token ID incrementing and ownership lists.
* **Implementation Risk:** Low. Controlled by backend admin signing.
