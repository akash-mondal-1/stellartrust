# 🚀 Deployment Summary

This document registers the active hosting parameters, deployment dates, and target platform configurations for StellarTrust.

---

## 📅 Deployment Context
*   **Deployment Date**: June 16, 2026
*   **Environment**: Production MVP Submission
*   **Target Blockchain Network**: Stellar Testnet
*   **Testnet Horizon RPC**: `https://soroban-testnet.stellar.org:443`
*   **Testnet Network Passphrase**: `Test Stellar Network ; September 2015`

---

## ⛓️ Smart Contract ID Manifest

| Contract | Active Contract ID |
| :--- | :--- |
| **Identity Registry** | `CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR` |
| **Escrow Manager** | `CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU` |
| **Reputation Engine** | `CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD` |
| **Achievement NFT Certs** | `CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK` |

---

## ☁️ Frontend & Database Hosting
*   **Web App Platform**: **Vercel** (`apps/web` root directory preset Next.js App Router).
*   **Database & RLS Engine**: **Supabase Cloud** (PostgreSQL hosting REST APIs with row-level policies).
*   **Error Monitoring Service**: **Sentry Cloud** (Sentry exception logging tracking edge and client runs).
*   **Product Analytics Service**: **PostHog Cloud** (Tracking core workflow user triggers).
