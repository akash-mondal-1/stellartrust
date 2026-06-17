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

/**
 * Fetch agreement details directly from Escrow smart contract state.
 */
export async function getAgreement(agreementId: string): Promise<any> {
  const agreementIdNum = parseInt(agreementId);
  if (isNaN(agreementIdNum)) {
    return null;
  }
  try {
    const idScVal = nativeToScVal(agreementIdNum);
    const result = await queryContract(ESCROW_CONTRACT, 'get_agreement', [idScVal]);
    if (!result) return null;
    
    // Map status index to string
    const statusMap = ['Created', 'Funded', 'Accepted', 'Submitted', 'Approved', 'Released', 'Disputed', 'Cancelled'];
    const statusStr = statusMap[result.status] || 'Created';

    return {
      id: result.id.toString(),
      client_address: result.client,
      freelancer_address: result.freelancer,
      amount: Number(result.amount) / 10000000, // Stroops to XLM
      token_address: result.token,
      deadline: new Date(Number(result.deadline) * 1000).toISOString(),
      status: statusStr,
      milestone_count: Number(result.milestone_count),
      current_milestone: Number(result.current_milestone),
      funded_amount: Number(result.funded_amount) / 10000000
    };
  } catch (err) {
    console.error(`Failed to query agreement ${agreementId} on-chain:`, err);
    return null;
  }
}

/**
 * Decodes a base64 XDR ScVal string or parsed ScVal object.
 */
export function decodeScVal(val: any): any {
  if (!val) return null;
  try {
    if (typeof val === 'string') {
      return scValToNative(xdr.ScVal.fromXDR(val, 'base64'));
    }
    return scValToNative(val);
  } catch (err) {
    console.error("Failed to decode ScVal:", err);
    return null;
  }
}

/**
 * Query live contract events from Stellar Testnet RPC.
 */
export async function getBlockchainEvents(limit = 100): Promise<any[]> {
  try {
    const latestLedgerRes = await server.getLatestLedger();
    const sequence = latestLedgerRes.sequence;
    const startLedger = Math.max(1, sequence - 50000);
    
    console.log(`Fetching blockchain events from ledger ${startLedger} to ${sequence}...`);
    
    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [ESCROW_CONTRACT, REPUTATION_CONTRACT, NFT_CONTRACT]
        }
      ],
      limit
    });

    if (!response || !response.events) {
      return [];
    }

    return response.events.map(ev => {
      const decodedTopics = ev.topic.map(t => decodeScVal(t));
      const decodedValue = decodeScVal(ev.value);
      
      let eventType = 'wallet_connected';
      let walletAddress = 'GDXFP76X2XVYSQAQTAPY3QTDWVJYEW732A6RDJOGUUAEVNPQHBC3LSX4'; // fallback admin
      let metadata: any = { description: `On-chain event registered` };
      
      const primaryTopic = decodedTopics[0];
      
      if (ev.contractId?.toString() === ESCROW_CONTRACT) {
        const agreementIdStr = decodedTopics[1]?.toString() || '';
        if (primaryTopic === 'created') {
          eventType = 'escrow_created';
          metadata = {
            description: `On-chain agreement #${agreementIdStr} created`,
            agreement_id: agreementIdStr,
            amount: decodedValue ? parseFloat(decodedValue.toString()) / 10000000 : 0
          };
        } else if (primaryTopic === 'funded') {
          eventType = 'escrow_funded';
          metadata = {
            description: `Escrow funded on-chain for agreement #${agreementIdStr}`,
            agreement_id: agreementIdStr,
            amount: decodedValue ? parseFloat(decodedValue.toString()) / 10000000 : 0
          };
        } else if (primaryTopic === 'accepted') {
          eventType = 'wallet_connected';
          walletAddress = decodedValue?.toString() || '';
          metadata = {
            description: `Agreement #${agreementIdStr} accepted by freelancer`,
            agreement_id: agreementIdStr,
            freelancer: walletAddress
          };
        } else if (primaryTopic === 'submitted') {
          eventType = 'milestone_completed';
          metadata = {
            description: `Work submitted for Milestone ${Number(decodedValue) + 1} of agreement #${agreementIdStr}`,
            agreement_id: agreementIdStr,
            milestone: decodedValue
          };
        } else if (primaryTopic === 'approved') {
          eventType = 'milestone_completed';
          metadata = {
            description: `Work approved for Milestone ${Number(decodedValue) + 1} of agreement #${agreementIdStr}`,
            agreement_id: agreementIdStr,
            milestone: decodedValue
          };
        } else if (primaryTopic === 'released') {
          eventType = 'milestone_completed';
          metadata = {
            description: `Milestone payment of ${decodedValue ? parseFloat(decodedValue.toString()) / 10000000 : 0} XLM released for agreement #${agreementIdStr}`,
            agreement_id: agreementIdStr,
            amount: decodedValue ? parseFloat(decodedValue.toString()) / 10000000 : 0
          };
        } else if (primaryTopic === 'disputed') {
          eventType = 'milestone_completed';
          walletAddress = decodedValue?.toString() || '';
          metadata = {
            description: `Dispute raised on agreement #${agreementIdStr}`,
            agreement_id: agreementIdStr,
            by: walletAddress
          };
        } else if (primaryTopic === 'refunded') {
          eventType = 'milestone_completed';
          metadata = {
            description: `Agreement #${agreementIdStr} refunded to client`,
            agreement_id: agreementIdStr,
            amount: decodedValue ? parseFloat(decodedValue.toString()) / 10000000 : 0
          };
        }
      } else if (ev.contractId?.toString() === REPUTATION_CONTRACT) {
        if (primaryTopic === 'review') {
          eventType = 'reputation_updated';
          const reviewee = decodedTopics[1]?.toString() || '';
          const reviewer = decodedTopics[2]?.toString() || '';
          walletAddress = reviewer;
          const rating = decodedValue[0];
          const agreementIdStr = decodedValue[1]?.toString() || '';
          const comment = decodedValue[2]?.toString() || '';
          
          metadata = {
            description: `@${reviewer.substring(0,6)} registered ${rating}★ review for @${reviewee.substring(0,6)}`,
            rating,
            agreement_id: agreementIdStr,
            comment,
            target: reviewee
          };
        }
      } else if (ev.contractId?.toString() === NFT_CONTRACT) {
        if (primaryTopic === 'nft_mint') {
          eventType = 'nft_minted';
          const freelancer = decodedTopics[1]?.toString() || '';
          const tokenId = decodedTopics[2]?.toString() || '';
          walletAddress = freelancer;
          metadata = {
            description: `Minted achievement NFT #${tokenId} for @${freelancer.substring(0,6)}`,
            freelancer,
            token_id: tokenId
          };
        }
      }

      return {
        id: ev.id,
        wallet_address: walletAddress,
        event_type: eventType,
        session_id: `chain_${ev.ledger}`,
        metadata,
        created_at: ev.ledgerClosedAt || new Date().toISOString()
      };
    });
  } catch (err) {
    console.error("Failed to query live contract events from Stellar RPC:", err);
    return [];
  }
}

// Re-export SDK helpers for use in components
export { nativeToScVal, scValToNative, ScInt, Address };
