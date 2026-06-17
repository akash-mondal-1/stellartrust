const { rpc, Contract, scValToNative, xdr } = require('@stellar/stellar-sdk');

const RPC_URL = 'https://soroban-testnet.stellar.org';
const ESCROW_CONTRACT = 'CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ';
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
    return null;
  }
}

async function run() {
  console.log("Scanning agreement IDs from 1 to 200 in parallel...");
  const promises = [];
  for (let id = 1; id <= 200; id++) {
    const idScVal = xdr.ScVal.scvU32(id);
    promises.push(
      queryContract(ESCROW_CONTRACT, 'get_agreement', [idScVal]).then(result => {
        if (result) {
          console.log(`FOUND ID ${id}: status=${result.status}, client=${result.client}, freelancer=${result.freelancer}`);
        }
      })
    );
  }
  await Promise.all(promises);
  console.log("Parallel scan complete.");
}

run();
