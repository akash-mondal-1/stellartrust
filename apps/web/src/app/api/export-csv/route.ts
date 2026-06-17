import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET: Retrieve all aggregated validation events from server disk
export async function GET() {
  try {
    const jsonPath = path.resolve(process.cwd(), 'events.json');
    let events = [];
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      try {
        events = JSON.parse(data);
      } catch (e) {
        events = [];
      }
    }
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add new validation events, merge with existing ones, and rebuild CSV
export async function POST(request: Request) {
  try {
    const { events: incomingEvents } = await request.json();
    if (!incomingEvents || !Array.isArray(incomingEvents)) {
      return NextResponse.json({ error: 'Invalid events array' }, { status: 400 });
    }

    const jsonPath = path.resolve(process.cwd(), 'events.json');
    let existingEvents: any[] = [];
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      try {
        existingEvents = JSON.parse(data);
      } catch (e) {
        existingEvents = [];
      }
    }

    // Merge incoming events into existing events on disk by ID
    incomingEvents.forEach((ev: any) => {
      if (!ev.id) {
        ev.id = Math.random().toString(36).substring(2, 11);
      }
      if (!ev.created_at) {
        ev.created_at = new Date().toISOString();
      }
      const exists = existingEvents.some((existing: any) => existing.id === ev.id);
      if (!exists) {
        existingEvents.push(ev);
      }
    });

    // Write merged list to disk
    fs.writeFileSync(jsonPath, JSON.stringify(existingEvents, null, 2), 'utf8');

    // CSV headers matching Phase 3 constraints:
    // wallet_address, action, timestamp, transaction_hash, session_id
    const headers = ['wallet_address', 'action', 'timestamp', 'transaction_hash', 'session_id'];
    const rows = existingEvents.map(e => {
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

    return NextResponse.json({ success: true, path: targetPath, events: existingEvents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
