import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { events } = await request.json();
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events array' }, { status: 400 });
    }

    // CSV headers matching Phase 3 constraints:
    // wallet_address, action, timestamp, transaction_hash, session_id
    const headers = ['wallet_address', 'action', 'timestamp', 'transaction_hash', 'session_id'];
    const rows = events.map(e => {
      const txHash = e.metadata?.tx_hash || e.metadata?.tx || e.metadata?.transaction_hash || '';
      return [
        e.wallet_address || '',
        e.event_type || '',
        e.created_at || new Date().toISOString(),
        txHash,
        e.session_id || ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n') + '\n';

    // Target: submission-proof/user-testing/10-user-wallet-proof.csv
    const targetPath = path.resolve(process.cwd(), '../../submission-proof/user-testing/10-user-wallet-proof.csv');
    
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, csvContent, 'utf8');

    return NextResponse.json({ success: true, path: targetPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
