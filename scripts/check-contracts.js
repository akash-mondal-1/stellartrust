const { rpc, Contract, Address, Networks, TransactionBuilder, Account } = require('@stellar/stellar-sdk');

const server = new rpc.Server("https://soroban-testnet.stellar.org");
const networkPassphrase = Networks.TESTNET;

const contracts = {
  identity: "CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR",
  escrow: "CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU",
  reputation: "CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD",
  nft: "CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK",
};

// Dummy source account for simulation
const dummySource = "GCHZBAUOHKKN2B7VUNYHXNGM5L6LAEETL5T4PZGBZJ3JDRP2N2V4GNET";

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
      if (sim.error.includes("Already initialized") || sim.error.includes("already initialized")) {
        console.log(`-> ${name} is ALREADY initialized.`);
      } else {
        console.log(`-> Simulation failed with error: ${sim.error}`);
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
