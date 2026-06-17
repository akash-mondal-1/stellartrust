const { rpc } = require('@stellar/stellar-sdk');

const RPC_URL = 'https://soroban-testnet.stellar.org';
const ESCROW_CONTRACT = 'CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ';
const server = new rpc.Server(RPC_URL);

async function run() {
  try {
    const latestLedgerRes = await server.getLatestLedger();
    const sequence = latestLedgerRes.sequence;
    const startLedger = Math.max(1, sequence - 1000);
    
    const response = await server.getEvents({
      startLedger,
      filters: [{ type: 'contract', contractIds: [ESCROW_CONTRACT] }],
      limit: 1
    });

    if (response.events.length > 0) {
      const ev = response.events[0];
      console.log("ev.contractId:", ev.contractId);
      console.log("ev.contractId.toString():", ev.contractId?.toString());
      console.log("Is equal to ESCROW_CONTRACT?:", ev.contractId?.toString() === ESCROW_CONTRACT);
    } else {
      console.log("No events found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
