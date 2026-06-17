import { NextResponse } from 'next/server';
import { 
  rpc, 
  Contract, 
  Address, 
  Networks, 
  TransactionBuilder, 
  Keypair, 
  BASE_FEE,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT || 'CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU';

// Admin Key (Fallback to the deployed admin key we audited)
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'SD6ERC4I3RCZJ2NQLBYPHWN75FHB3CKQXO6XBU2I7UVE4QW6KEMCGT6R';

export async function POST(request: Request) {
  try {
    const { freelancer, agreementId, projectName, projectHash } = await request.json();
    
    if (!freelancer || !agreementId || !projectName || !projectHash) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log(`[API Admin Mint NFT] Minting certificate for: ${freelancer}, Project: ${projectName}`);

    const adminKp = Keypair.fromSecret(ADMIN_SECRET);
    const adminAddress = adminKp.publicKey();

    const server = new rpc.Server(RPC_URL);

    // 1. Fetch admin account sequence
    const sourceAccount = await server.getAccount(adminAddress);

    // 2. Build mint_project_nft call
    const contract = new Contract(NFT_CONTRACT);
    const op = contract.call(
      'mint_project_nft',
      new Address(freelancer).toScVal(), // freelancer address receiving the NFT
      nativeToScVal(agreementId), // agreement ID (string)
      nativeToScVal(projectName), // project name (string)
      nativeToScVal(projectHash), // project hash (string)
      new Address(adminAddress).toScVal() // authority/admin address
    );

    let tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(op)
    .setTimeout(30)
    .build();

    // 3. Simulate and prepare transaction
    tx = await server.prepareTransaction(tx);

    // 4. Sign with admin key
    tx.sign(adminKp);

    // 5. Submit to network
    const response = await server.sendTransaction(tx);
    if (response.status !== 'PENDING') {
      return NextResponse.json({ error: `Transaction rejected: ${response.status}` }, { status: 500 });
    }

    const txHash = response.hash;
    console.log(`[API Admin Mint NFT] Submitted tx: ${txHash}. Polling status...`);

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
      const tokenId = txResult.returnValue ? scValToNative(txResult.returnValue) : null;
      console.log(`[API Admin Mint NFT] Certificate minted successfully! Token ID: ${tokenId}`);
      return NextResponse.json({ 
        success: true, 
        txHash, 
        tokenId,
        message: 'Achievement certificate NFT minted successfully.' 
      });
    } else {
      return NextResponse.json({ error: `Transaction failed with status: ${txResult.status}` }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[API Admin Mint NFT] Error:', err);
    return NextResponse.json({ error: err.message || 'Minting failed' }, { status: 500 });
  }
}
