const fs = require('fs');
const path = require('path');

const jsonEventsPath = path.resolve(__dirname, '../apps/web/events.json');
const events = fs.existsSync(jsonEventsPath) ? JSON.parse(fs.readFileSync(jsonEventsPath, 'utf8')) : [];

console.log(`Loaded ${events.length} events from events.json`);

const walletStats = {};

events.forEach(e => {
  const addr = e.wallet_address;
  if (!walletStats[addr]) {
    walletStats[addr] = {
      address: addr,
      connectionSources: new Set(),
      modes: new Set(),
      txCount: 0,
      realTxs: [],
      hasLiveConnected: false,
      eventTypes: new Set()
    };
  }
  
  const stats = walletStats[addr];
  stats.eventTypes.add(e.event_type);
  
  if (e.event_type === 'wallet_connected') {
    const type = e.metadata?.wallet_type || e.metadata?.wallet || '';
    const mode = e.metadata?.mode || '';
    if (type) stats.connectionSources.add(type.toLowerCase());
    if (mode) stats.modes.add(mode.toLowerCase());
    if (mode.toLowerCase() === 'live' || ['freighter', 'albedo', 'xbull'].includes(type.toLowerCase())) {
      stats.hasLiveConnected = true;
    }
  }
  
  const txHash = e.txHash || e.metadata?.tx_hash || e.metadata?.transaction_hash;
  if (txHash) {
    stats.txCount++;
    if (txHash.length > 20 && !txHash.startsWith('mock') && !txHash.startsWith('chain_') && !txHash.startsWith('sess_')) {
      stats.realTxs.push({
        event: e.event_type,
        hash: txHash
      });
    }
  }
});

const sorted = Object.values(walletStats).sort((a, b) => {
  const aReal = a.realTxs.length > 0 || a.hasLiveConnected;
  const bReal = b.realTxs.length > 0 || b.hasLiveConnected;
  if (aReal && !bReal) return -1;
  if (!aReal && bReal) return 1;
  return a.address.localeCompare(b.address);
});

console.log('\n--- WALLETS IN EVENTS.JSON ---');
sorted.forEach((w, idx) => {
  const isReal = w.realTxs.length > 0 || w.hasLiveConnected;
  console.log(`${idx + 1}. Wallet: ${w.address}`);
  console.log(`   Type: ${isReal ? 'VERIFIED REAL' : 'DEMO/SANDBOX'}`);
  console.log(`   Events: ${Array.from(w.eventTypes).join(', ')}`);
  console.log(`   Connection Sources: ${Array.from(w.connectionSources).join(', ')}`);
  console.log(`   Modes: ${Array.from(w.modes).join(', ')}`);
  console.log(`   Total TXs: ${w.txCount}`);
  if (w.realTxs.length > 0) {
    console.log(`   Real TXs: ${w.realTxs.map(tx => `${tx.event}:${tx.hash.substring(0, 10)}...`).join(', ')}`);
  }
  console.log('');
});
