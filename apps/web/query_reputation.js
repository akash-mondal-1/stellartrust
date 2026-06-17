const { rpc, Contract, scValToNative, Address, xdr } = require('@stellar/stellar-sdk');

const RPC_URL = 'https://soroban-testnet.stellar.org';
const REPUTATION_CONTRACT = 'CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6';
const server = new rpc.Server(RPC_URL);

async function queryContract(contractId, functionName, args = []) {
  try {
    const dummySource = 'GDXFP76X2XVYSQAQTAPY3QTDWVJYEW732A6RDJOGUUAEVNPQHBC3LSX4';
    const acc = new (require('@stellar/stellar-sdk').Account)(dummySource, '0');
    const contract = new Contract(contractId);
    const op = contract.call(functionName, ...args);

    const tx = new (require('@stellar/stellar-sdk').TransactionBuilder)(acc, {
      fee: '100',
      networkPassphrase: 'Test Stellar Network ; September 2015',
    })
    .addOperation(op)
    .setTimeout(30)
    .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      return scValToNative(sim.result.retval);
    }
    return null;
  } catch (err) {
    console.error("Simulation error:", err);
    return null;
  }
}

async function run() {
  const client = 'GBELVX4OUOBRIKRCWPM5ZOAXCZ4TODLYVS54ZJ2FTYTFMAG3GYJ37RFR';
  const freelancer = 'GC24GG7H7TDIWCNWMMUOHZXVPYOD6REGIBN2RVR44HDKGFUPEHKALAK4';

  console.log("Querying client on-chain reputation...");
  const repClient = await queryContract(REPUTATION_CONTRACT, 'get_reputation', [new Address(client).toScVal()]);
  console.log("Client:", repClient);

  console.log("Querying freelancer on-chain reputation...");
  const repFreelancer = await queryContract(REPUTATION_CONTRACT, 'get_reputation', [new Address(freelancer).toScVal()]);
  console.log("Freelancer:", repFreelancer);
}

run();
