import { 
  rpc, 
  Contract, 
  Address, 
  Networks, 
  TransactionBuilder, 
  Account, 
  BASE_FEE, 
  nativeToScVal, 
  scValToNative, 
  ScInt, 
  xdr 
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// Network Configurations
export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// Contract IDs
export const IDENTITY_CONTRACT = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT || 'CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR';
export const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT || 'CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU';
export const REPUTATION_CONTRACT = process.env.NEXT_PUBLIC_REPUTATION_CONTRACT || 'CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD';
export const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT || 'CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK';

// XLM Native Token Contract ID
export const XLM_TOKEN_CONTRACT = 'CDLZFC3SYJYDZT7KMGV55XX2XZPP2D4EE3CYC5EFO7ISXYCLAT234TRZ';

// Initialize RPC Server
const server = new rpc.Server(RPC_URL);

/**
 * Validates a Stellar public key or contract address.
 * Throws an error if invalid.
 */
export function validateAddress(addr: string): void {
  try {
    new Address(addr);
  } catch (e) {
    throw new Error(`Invalid address format: "${addr}". Must be a valid Stellar public key (starts with G) or Contract ID (starts with C).`);
  }
}

/**
 * Execute a read-only query to a Soroban contract via simulation.
 */
export async function queryContract(
  contractId: string,
  functionName: string,
  args: any[] = []
): Promise<any> {
  try {
    // GDXFP... is the admin/deployer address used as dummy source
    const dummySource = 'GDXFP76X2XVYSQAQTAPY3QTDWVJYEW732A6RDJOGUUAEVNPQHBC3LSX4';
    const sourceAccount = new Account(dummySource, '0');
    const contract = new Contract(contractId);
    const op = contract.call(functionName, ...args);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(op)
    .setTimeout(30)
    .build();

    const sim = await server.simulateTransaction(tx);
    
    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      return scValToNative(sim.result.retval);
    } else if (rpc.Api.isSimulationError(sim)) {
      console.warn(`Simulation warning/error for ${functionName}:`, sim.error);
      return null;
    }
    return null;
  } catch (err: any) {
    console.error(`Error querying contract ${functionName}:`, err);
    return null;
  }
}

/**
 * Build, simulate, sign via Freighter, and submit a state-changing transaction to Stellar Testnet.
 */
export async function submitTransaction(
  senderAddress: string,
  contractId: string,
  functionName: string,
  args: any[] = []
): Promise<{ txHash: string; result: any }> {
  validateAddress(senderAddress);
  validateAddress(contractId);

  console.log(`Preparing tx for ${functionName} from sender ${senderAddress}...`);
  
  // 1. Fetch current account details for sequence number
  const sourceAccount = await server.getAccount(senderAddress);
  
  // 2. Build transaction envelope containing contract call operation
  const contract = new Contract(contractId);
  const op = contract.call(functionName, ...args);
  
  let tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  .addOperation(op)
  .setTimeout(30)
  .build();

  // 3. Simulate and prepare transaction (appends footprint & resource fees)
  try {
    tx = await server.prepareTransaction(tx);
  } catch (prepErr: any) {
    console.error("Simulation / Prepare transaction failed:", prepErr);
    throw new Error(`Simulation failed: ${prepErr.message || prepErr}`);
  }

  // 4. Request Freighter signature
  const xdrString = tx.toXDR();
  console.log("Requesting signature from Freighter...");
  const signResult = await signTransaction(xdrString, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: senderAddress,
  });

  if (signResult.error) {
    throw new Error(`Freighter signing failed: ${signResult.error}`);
  }

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);

  // 5. Submit to RPC
  console.log("Submitting transaction to Stellar Testnet...");
  const response = await server.sendTransaction(signedTx);
  
  if (response.status !== 'PENDING') {
    throw new Error(`Transaction rejected by RPC: ${response.status}`);
  }

  const txHash = response.hash;
  console.log(`Transaction submitted successfully. Hash: ${txHash}. Polling status...`);

  // 6. Poll status until mined
  let txResult = await server.getTransaction(txHash);
  let attempts = 0;
  const maxAttempts = 30;

  while (
    txResult.status === 'NOT_FOUND' &&
    attempts < maxAttempts
  ) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    txResult = await server.getTransaction(txHash);
  }

  if (txResult.status === 'SUCCESS') {
    const nativeVal = txResult.returnValue ? scValToNative(txResult.returnValue) : null;
    console.log(`✓ Transaction confirmed! Status: SUCCESS.`);
    return { txHash, result: nativeVal };
  } else {
    console.error("Transaction failed in consensus:", txResult);
    throw new Error(`Transaction execution failed. Consensus status: ${txResult.status}`);
  }
}

// Re-export SDK helpers for use in components
export { nativeToScVal, scValToNative, ScInt, Address };
