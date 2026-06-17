import { NextResponse } from 'next/server';
import { 
  rpc, 
  Contract, 
  Address, 
  Networks, 
  TransactionBuilder, 
  Keypair, 
  BASE_FEE 
} from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const IDENTITY_CONTRACT = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT || 'CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR';

// Admin Key (Fallback to the deployed admin key we audited)
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'SD6ERC4I3RCZJ2NQLBYPHWN75FHB3CKQXO6XBU2I7UVE4QW6KEMCGT6R';

export async function POST(request: Request) {
  try {
    const { wallet } = await request.json();
    if (!wallet) {
      return NextResponse.json({ error: 'Missing user wallet address' }, { status: 400 });
    }

    console.log(`[API Admin Verify] Verifying profile for: ${wallet}`);

    const adminKp = Keypair.fromSecret(ADMIN_SECRET);
    const adminAddress = adminKp.publicKey();

    const server = new rpc.Server(RPC_URL);

    // 1. Fetch admin account sequence
    const sourceAccount = await server.getAccount(adminAddress);

    // 2. Build verify_user call
    const contract = new Contract(IDENTITY_CONTRACT);
    const op = contract.call(
      'verify_user', 
      new Address(wallet).toScVal(), // user profile address
      new Address(adminAddress).toScVal() // verifier/admin address
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
    console.log(`[API Admin Verify] Submitted tx: ${txHash}. Polling status...`);

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
      console.log(`[API Admin Verify] Profile ${wallet} verified successfully on-chain!`);
      return NextResponse.json({ 
        success: true, 
        txHash, 
        message: 'Profile verified on-chain by administrator check.' 
      });
    } else {
      return NextResponse.json({ error: `Transaction failed with status: ${txResult.status}` }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[API Admin Verify] Error:', err);
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
