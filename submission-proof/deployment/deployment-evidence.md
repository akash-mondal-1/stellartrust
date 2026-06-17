# 🧾 Deployment Evidence Verification Guide

This document lists steps to verify that the deployed contract WASM code matches the source code in this repository.

---

## 🛠️ Verifying WASM Integrity (Reproducible Builds)

Soroban contract code can be verified on-chain by comparing the SHA256 of the compiled `.wasm` file with the WASM code hash on-chain:

### 1. Retrieve Deployed WASM Hashes
You can inspect the deployed contract details via Stellar CLI or Stellar.Expert to find the `wasm_hash` bound to the contracts:
```bash
# Example query to output contract metadata
stellar contract id spec --id CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP --network testnet
```

### 2. Generate Local WASM Hashes
Compile the contracts locally using the compiler commands to output optimized release `.wasm` files:
```bash
# Run WASM builds
cargo build --target wasm32-unknown-unknown --release --manifest-path contracts/Cargo.toml
```

Generate the SHA256 hash of the generated binaries (adjust directory target path if custom workspace configured):
```powershell
# PowerShell verification
Get-FileHash contracts/target/wasm32-unknown-unknown/release/stellartrust_identity.wasm -Algorithm SHA256
```
Compare the output SHA256 hash against the `wasm_hash` shown on Stellar.Expert to verify deployment integrity.

---

## 🗄️ Supabase Migration Evidence
The schema setup files are fully stored under:
`supabase/migrations/20260616000000_init_schema.sql`

This file builds the SQL structures for:
*   Table indices optimizing wallet address queries.
*   Foreign key constraints connecting reviews to escrow agreements.
*   Row-Level Security (RLS) policies isolating profile editing permissions.
