# StellarTrust Production Deployment Guide

This guide describes the complete procedure for deploying StellarTrust to a production environment (Next.js frontend on Vercel, PostgreSQL schema on Supabase Cloud, and smart contracts on Stellar Testnet).

---

## 📋 Production Deployment Checklist

- [ ] **Soroban Contracts:** Build WASM targets and deploy all 4 contracts to Stellar Testnet.
- [ ] **Database Schema:** Apply SQL migration scripts to Supabase production cluster.
- [ ] **Supabase RLS Policies:** Ensure Row Level Security (RLS) policies are active for profiles, reviews, and feedback.
- [ ] **Analytics Setup:** Initialize PostHog project and retrieve key.
- [ ] **Monitoring Setup:** Initialize Sentry project and retrieve DSN.
- [ ] **Vercel Frontend:** Configure build command, install commands, root directories, and inject environment variables.
- [ ] **Verify Deployments:** Execute verification checks.

---

## ⚡ 1. Smart Contracts Deployment (Stellar Testnet)

To deploy the smart contracts to Testnet from a clean machine:

1.  **Prerequisites:** Install the Stellar CLI:
    ```bash
    cargo install --locked stellar-cli
    ```
2.  **Run Deployer Script:**
    Execute the automated build and deployment script:
    ```bash
    chmod +x scripts/deploy-contracts.sh
    ./scripts/deploy-contracts.sh
    ```
    This script will:
    *   Initialize a new keys deployer key (`stellartrust-deployer`).
    *   Faucet test funds from Friendbot.
    *   Compile the 4 contracts (`identity`, `escrow`, `reputation`, `nft`) to WASM binaries.
    *   Deploy WASM to Stellar Testnet and return the deployed Contract IDs.
    *   Generate a `deployed.env` configuration file in `apps/web/`.

---

## 🗄️ 2. Supabase Production Setup

To set up the PostgreSQL database in Supabase:

1.  Create a new project in the [Supabase Dashboard](https://supabase.com).
2.  Navigate to the **SQL Editor** on the left menu.
3.  Click **New Query** and copy the contents of [supabase/migrations/20260616000000_init_schema.sql](file:///d:/StellarFlow%204/supabase/migrations/20260616000000_init_schema.sql).
4.  Click **Run** to execute the query. This sets up all tables, index optimizations, and creates the Row Level Security (RLS) access policies.
5.  Retrieve the API parameters from the **Project Settings -> API** section:
    *   `Project URL` (maps to `NEXT_PUBLIC_SUPABASE_URL`)
    *   `API Anon Key` (maps to `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## ☁️ 3. Vercel Deployment Settings

Configure Vercel to host the Next.js App Router frontend:

1.  Create a new project on [Vercel Dashboard](https://vercel.com).
2.  Import your GitHub repository containing StellarTrust.
3.  Set the **Project Settings**:
    *   **Framework Preset:** Next.js
    *   **Root Directory:** `apps/web` (Important: do not build from the root workspace directory)
    *   **Build Command:** `npm run build`
    *   **Install Command:** `npm install --no-scripts --legacy-peer-deps`
4.  Configure the **Environment Variables** in Vercel settings (refer to [.env.example](file:///d:/StellarFlow%204/.env.example) for placeholders and replace with the deployed values):
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `NEXT_PUBLIC_STELLAR_NETWORK` (`testnet`)
    *   `NEXT_PUBLIC_IDENTITY_CONTRACT`
    *   `NEXT_PUBLIC_ESCROW_CONTRACT`
    *   `NEXT_PUBLIC_REPUTATION_CONTRACT`
    *   `NEXT_PUBLIC_NFT_CONTRACT`
    *   `NEXT_PUBLIC_POSTHOG_KEY`
    *   `NEXT_PUBLIC_POSTHOG_HOST`
    *   `NEXT_PUBLIC_SENTRY_DSN`
5.  Click **Deploy**.

---

## 🔍 4. Deployment Verification

You can verify that all components are responding correctly by executing the verification check list below.

Create a verification file `scripts/verify-deploy.js` to run sanity checks:
```javascript
// verify-deploy.js
// Run: node scripts/verify-deploy.js

const https = require('https');

const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  identityContract: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT,
  escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT,
};

console.log("=== Running Deployment Verification ===");

// 1. Verify Supabase Endpoint
if (config.supabaseUrl) {
  https.get(`${config.supabaseUrl}/rest/v1/`, (res) => {
    console.log(`✓ Supabase Endpoint Connection: HTTP ${res.statusCode}`);
  }).on('error', (e) => {
    console.log(`❌ Supabase Endpoint Connection Failed: ${e.message}`);
  });
} else {
  console.log("⚠️ NEXT_PUBLIC_SUPABASE_URL environment variable is missing.");
}

// 2. Verify Stellar Testnet RPC
https.get(`https://soroban-testnet.stellar.org/`, (res) => {
  console.log(`✓ Soroban Testnet RPC Connection: HTTP ${res.statusCode}`);
}).on('error', (e) => {
  console.log(`❌ Soroban Testnet RPC Connection Failed: ${e.message}`);
});

console.log(`✓ Identity Contract ID: ${config.identityContract || 'Not Injected'}`);
console.log(`✓ Escrow Contract ID: ${config.escrowContract || 'Not Injected'}`);
console.log("=======================================");
```
Execute it to verify:
```bash
node scripts/verify-deploy.js
```
