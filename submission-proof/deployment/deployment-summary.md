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
| **Identity Registry** | `CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP` |
| **Escrow Manager** | `CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ` |
| **Reputation Engine** | `CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6` |
| **Achievement NFT Certs** | `CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU` |

---

## ☁️ Frontend & Database Hosting
*   **Web App Platform**: **Vercel** (`apps/web` root directory preset Next.js App Router).
*   **Database & RLS Engine**: **Supabase Cloud** (PostgreSQL hosting REST APIs with row-level policies).
*   **Error Monitoring Service**: **Sentry Cloud** (Sentry exception logging tracking edge and client runs).
*   **Product Analytics Service**: **PostHog Cloud** (Tracking core workflow user triggers).
