const { rpc, Contract, Address, Networks, TransactionBuilder, Account, Keypair, BASE_FEE } = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');
const https = require('https');

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);
const networkPassphrase = Networks.TESTNET;

// Admin secret key
const ADMIN_SECRET = 'SD6ERC4I3RCZJ2NQLBYPHWN75FHB3CKQXO6XBU2I7UVE4QW6KEMCGT6R';
const adminKp = Keypair.fromSecret(ADMIN_SECRET);
const adminAddress = adminKp.publicKey();

// Load contract addresses from apps/web/.env.local or apps/web/.env.deployed
const envPaths = [
  path.resolve(__dirname, '../apps/web/.env.local'),
  path.resolve(__dirname, '../apps/web/.env.deployed')
];

let identityId = "";
let reputationId = "";
let nftId = "";

envPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        const cleanVal = val.split(/\s+/).pop().trim();
        if (key === 'NEXT_PUBLIC_IDENTITY_CONTRACT' && cleanVal.startsWith('C')) {
          identityId = cleanVal;
        }
        if (key === 'NEXT_PUBLIC_REPUTATION_CONTRACT' && cleanVal.startsWith('C')) {
          reputationId = cleanVal;
        }
        if (key === 'NEXT_PUBLIC_NFT_CONTRACT' && cleanVal.startsWith('C')) {
          nftId = cleanVal;
        }
      }
    });
  }
});

async function fundAccount(address) {
  return new Promise((resolve) => {
    console.log(`Checking/Funding account via Friendbot: ${address}...`);
    https.get(`https://friendbot.stellar.org?addr=${address}`, (res) => {
      console.log(`Friendbot response code: ${res.statusCode}`);
      resolve();
    }).on('error', (err) => {
      console.warn(`Friendbot failed (might be already funded): ${err.message}`);
      resolve();
    });
  });
}

async function initializeContract(name, contractId) {
  if (!contractId) {
    console.log(`Skipping ${name}: No Contract ID found.`);
    return;
  }
  console.log(`Initializing ${name} contract (${contractId}) with admin ${adminAddress}...`);
  try {
    const sourceAccount = await server.getAccount(adminAddress);
    const contract = new Contract(contractId);
    
    // Simulate first to check if already initialized
    const op = contract.call("initialize", new Address(adminAddress).toScVal());
    let tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
    .addOperation(op)
    .setTimeout(30)
    .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      const errStr = sim.error ? sim.error.toString() : '';
      if (errStr.includes("Already initialized") || errStr.includes("already initialized") || errStr.includes("UnreachableCodeReached") || errStr.includes("InvalidAction")) {
        console.log(`-> ${name} is ALREADY initialized.`);
        return;
      }
      throw new Error(`Simulation failed: ${errStr}`);
    }

    // Prepare, sign, and submit
    tx = await server.prepareTransaction(tx);
    tx.sign(adminKp);
    
    console.log(`Submitting initialization transaction for ${name}...`);
    const response = await server.sendTransaction(tx);
    if (response.status !== 'PENDING') {
      throw new Error(`Transaction rejected by RPC: ${response.status}`);
    }
    
    const txHash = response.hash;
    let txResult = await server.getTransaction(txHash);
    let attempts = 0;
    while (txResult.status === 'NOT_FOUND' && attempts < 30) {
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
      txResult = await server.getTransaction(txHash);
    }
    
    if (txResult.status === 'SUCCESS') {
      console.log(`✓ ${name} initialized successfully! Tx Hash: ${txHash}`);
    } else {
      throw new Error(`Transaction failed in consensus. Status: ${txResult.status}`);
    }
  } catch (err) {
    console.error(`❌ Failed to initialize ${name}:`, err.message || err);
  }
}

async function run() {
  await fundAccount(adminAddress);
  // Wait a bit for ledger close
  await new Promise(r => setTimeout(r, 2000));
  await initializeContract("Identity", identityId);
  await initializeContract("Reputation", reputationId);
  await initializeContract("NFT", nftId);
}

run();
