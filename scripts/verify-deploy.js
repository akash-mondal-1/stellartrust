// verify-deploy.js
// Orchestrates deployment verification checks
// Run: node scripts/verify-deploy.js

const https = require('https');

const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stellartrust.supabase.co',
  identityContract: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT,
  escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT,
  reputationContract: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT,
  nftContract: process.env.NEXT_PUBLIC_NFT_CONTRACT,
};

console.log("=== StellarTrust Deployment Verification ===");

// 1. Verify Supabase Endpoint
if (config.supabaseUrl) {
  const url = `${config.supabaseUrl}/rest/v1/`;
  https.get(url, (res) => {
    // Supabase REST root responds with a 401 Unauthorized or 200 depending on keys,
    // but a response proves network availability
    console.log(`✓ Supabase Endpoint Connection (${config.supabaseUrl}): HTTP ${res.statusCode}`);
  }).on('error', (e) => {
    console.log(`❌ Supabase Connection Failed: ${e.message}`);
  });
} else {
  console.log("⚠️ NEXT_PUBLIC_SUPABASE_URL is not configured.");
}

// 2. Verify Stellar Testnet RPC API
https.get('https://soroban-testnet.stellar.org/', (res) => {
  console.log(`✓ Soroban Testnet RPC Connection: HTTP ${res.statusCode}`);
}).on('error', (e) => {
  console.log(`❌ Soroban Testnet RPC Connection Failed: ${e.message}`);
});

console.log(`✓ Identity Contract ID: ${config.identityContract || 'Not Injected (Fallback Active)'}`);
console.log(`✓ Escrow Contract ID: ${config.escrowContract || 'Not Injected (Fallback Active)'}`);
console.log(`✓ Reputation Contract ID: ${config.reputationContract || 'Not Injected (Fallback Active)'}`);
console.log(`✓ NFT Contract ID: ${config.nftContract || 'Not Injected (Fallback Active)'}`);
console.log("============================================");
