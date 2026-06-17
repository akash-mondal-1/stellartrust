const { rpc, Contract, Address, Networks, TransactionBuilder, Account } = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

const server = new rpc.Server("https://soroban-testnet.stellar.org");
const networkPassphrase = Networks.TESTNET;

// Load environment variables to check active contracts
const envPaths = [
  path.resolve(__dirname, '../apps/web/.env.local'),
  path.resolve(__dirname, '../apps/web/.env.deployed')
];

let identityContract = "CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR";
let escrowContract = "CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU";
let reputationContract = "CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD";
let nftContract = "CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK";

envPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        // Extract Contract ID if it's the last word (cleaning any extra output)
        const cleanVal = val.split(/\s+/).pop().trim();
        if (key === 'NEXT_PUBLIC_IDENTITY_CONTRACT' && cleanVal.startsWith('C')) {
          identityContract = cleanVal;
        }
        if (key === 'NEXT_PUBLIC_ESCROW_CONTRACT' && cleanVal.startsWith('C')) {
          escrowContract = cleanVal;
        }
        if (key === 'NEXT_PUBLIC_REPUTATION_CONTRACT' && cleanVal.startsWith('C')) {
          reputationContract = cleanVal;
        }
        if (key === 'NEXT_PUBLIC_NFT_CONTRACT' && cleanVal.startsWith('C')) {
          nftContract = cleanVal;
        }
      }
    });
  }
});

const contracts = {
  identity: identityContract,
  escrow: escrowContract,
  reputation: reputationContract,
  nft: nftContract,
};

// Dummy source account for simulation
const dummySource = "GDXFP76X2XVYSQAQTAPY3QTDWVJYEW732A6RDJOGUUAEVNPQHBC3LSX4";

async function checkContractInit(name, contractId) {
  console.log(`\nChecking ${name} contract (${contractId})...`);
  try {
    const sourceAccount = new Account(dummySource, "0");
    const contract = new Contract(contractId);
    
    // Simulate initialize call with dummy admin
    const op = contract.call("initialize", new Address(dummySource).toScVal());
    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
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
      } else {
        console.log(`-> Simulation failed with error: ${errStr}`);
      }
    } else {
      console.log(`-> ${name} is NOT initialized (simulation succeeded).`);
    }
  } catch (e) {
    console.log(`❌ Error checking ${name}: ${e.message}`);
  }
}

async function run() {
  console.log("=== StellarTrust Deployed Contracts Initialization Audit ===");
  for (const [name, addr] of Object.entries(contracts)) {
    if (name === 'escrow') {
      // Escrow does not have initialize method, skip
      console.log(`\nEscrow contract (${addr}) does not have an initialize method (skipping).`);
      continue;
    }
    await checkContractInit(name, addr);
  }
}

run();
