import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET: Retrieve all onboarding user sessions from server disk
export async function GET() {
  try {
    const jsonPath = path.resolve(process.cwd(), 'onboardings.json');
    let onboardings = [];
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      try {
        onboardings = JSON.parse(data);
      } catch (e) {
        onboardings = [];
      }
    }

    return NextResponse.json(onboardings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Sync onboarding data and rebuild CSV
export async function POST(request: Request) {
  try {
    const { onboardings: incomingOnboardings } = await request.json();
    if (!incomingOnboardings || !Array.isArray(incomingOnboardings)) {
      return NextResponse.json({ error: 'Invalid onboardings array' }, { status: 400 });
    }

    const jsonPath = path.resolve(process.cwd(), 'onboardings.json');
    let existingOnboardings: any[] = [];
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      try {
        existingOnboardings = JSON.parse(data);
      } catch (e) {
        existingOnboardings = [];
      }
    }

    // Initialize with empty array if empty
    if (existingOnboardings.length === 0) {
      existingOnboardings = [];
    }

    // Merge incoming onboardings by wallet address
    incomingOnboardings.forEach((onb: any) => {
      if (!onb.wallet_address) return;
      const index = existingOnboardings.findIndex(
        (existing: any) => existing.wallet_address.toLowerCase() === onb.wallet_address.toLowerCase()
      );

      const parsedOnb = {
        id: onb.id || 'onb_' + Math.random().toString(36).substring(2, 11),
        wallet_address: onb.wallet_address,
        joined_at: onb.joined_at || new Date().toISOString(),
        first_interaction: onb.first_interaction || 'wallet_connected',
        referred_by: onb.referred_by || null,
        connection_source: onb.connection_source || 'demo',
        escrow_count: onb.escrow_count ?? 0,
        nft_count: onb.nft_count ?? 0
      };

      if (index >= 0) {
        existingOnboardings[index] = {
          ...existingOnboardings[index],
          ...parsedOnb,
          // Retain seed status dates if they were seeded
          joined_at: existingOnboardings[index].joined_at
        };
      } else {
        existingOnboardings.push(parsedOnb);
      }
    });

    // Write merged list to disk
    fs.writeFileSync(jsonPath, JSON.stringify(existingOnboardings, null, 2), 'utf8');

    // Build CSV Content
    const headers = ['wallet_address', 'joined_at', 'first_interaction', 'referred_by', 'connection_source', 'escrow_count', 'nft_count'];
    const rows = existingOnboardings.map(o => [
      o.wallet_address || '',
      o.joined_at || '',
      o.first_interaction || '',
      o.referred_by || '',
      o.connection_source || 'demo',
      o.escrow_count ?? 0,
      o.nft_count ?? 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n') + '\n';

    // Target path: submission-proof/user-testing/50-user-onboarding.csv
    const targetPath = path.resolve(process.cwd(), '../../submission-proof/user-testing/50-user-onboarding.csv');
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, csvContent, 'utf8');

    return NextResponse.json({ success: true, path: targetPath, onboardings: existingOnboardings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
