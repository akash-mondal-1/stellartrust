const { rpc, scValToNative, decodeScVal } = require('@stellar/stellar-sdk');

const RPC_URL = 'https://soroban-testnet.stellar.org';
const REPUTATION_CONTRACT = 'CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6';
const server = new rpc.Server(RPC_URL);

// Simple scValToNative decoder
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
    const startLedger = Math.max(1, sequence - 50000);
    
    console.log(`Querying events from ledger ${startLedger} to ${sequence} for reputation contract ${REPUTATION_CONTRACT}...`);
    
    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [REPUTATION_CONTRACT]
        }
      ],
      limit: 100
    });

    console.log(`Found ${response.events.length} events.`);
    for (const ev of response.events) {
      const topics = ev.topic.map(t => decodeVal(t));
      const value = decodeVal(ev.value);
      console.log(`Event: ledger=${ev.ledger}, contract=${ev.contractId}, topics=`, topics, `, value=`, value, `, txHash=${ev.transactionHash}`);
    }
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}

run();
