const { rpc, scValToNative, Address } = require('@stellar/stellar-sdk');

const RPC_URL = 'https://soroban-testnet.stellar.org';
const ESCROW_CONTRACT = 'CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ';
const server = new rpc.Server(RPC_URL);

function decodeVal(val) {
  if (!val) return null;
  try {
    return scValToNative(val);
  } catch (e) {
    return null;
  }
}

async function run() {
  try {
    const latestLedgerRes = await server.getLatestLedger();
    const sequence = latestLedgerRes.sequence;
    const startLedger = Math.max(1, sequence - 10000);
    
    console.log(`Querying events from ledger ${startLedger} to ${sequence} for escrow contract ${ESCROW_CONTRACT}...`);
    
    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [ESCROW_CONTRACT]
        }
      ],
      limit: 10
    });

    console.log(`Found ${response.events.length} escrow events.`);
    for (const ev of response.events) {
      const topics = ev.topic.map(t => decodeVal(t));
      const value = decodeVal(ev.value);
      console.log(`Event: topics=`, topics, `, value=`, value);
    }
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}

run();
