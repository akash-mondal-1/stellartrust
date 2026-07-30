import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const hasKeys = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to write onboardings to local JSON and CSV files on disk
function syncOnboardingsToDisk(onboardings: any[]) {
  try {
    const jsonPath = path.resolve(process.cwd(), 'onboardings.json');
    fs.writeFileSync(jsonPath, JSON.stringify(onboardings, null, 2), 'utf8');
    
    const headers = ['wallet_address', 'joined_at', 'first_interaction', 'referred_by', 'connection_source', 'escrow_count', 'nft_count'];
    const rows = onboardings.map(o => [
      o.wallet_address || '',
      o.joined_at || '',
      o.first_interaction || '',
      o.referred_by || '',
      o.connection_source || 'demo',
      o.escrow_count ?? 0,
      o.nft_count ?? 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n') + '\n';
    const targetPath = path.resolve(process.cwd(), '../../submission-proof/user-testing/testnet-onboarding-registry.csv');
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, csvContent, 'utf8');
  } catch (fsError) {
    console.warn("Failed to write to local filesystem (likely Vercel env):", fsError);
  }
}

// GET: Retrieve all onboarding user sessions
export async function GET() {
  try {
    if (hasKeys) {
      const { data, error } = await supabase.from('onboardings').select('*');
      if (error) throw error;
      const onboardings = data || [];
      syncOnboardingsToDisk(onboardings);
      return NextResponse.json(onboardings);
    }

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

    if (hasKeys) {
      // Upsert into Supabase
      const toUpsert = incomingOnboardings.filter(o => o.wallet_address).map(onb => ({
        wallet_address: onb.wallet_address,
        joined_at: onb.joined_at || new Date().toISOString(),
        first_interaction: onb.first_interaction || 'wallet_connected',
        referred_by: onb.referred_by || null,
        connection_source: onb.connection_source || 'demo',
        escrow_count: onb.escrow_count ?? 0,
        nft_count: onb.nft_count ?? 0
      }));

      // Supabase uses 'wallet_address' as the unique constraint for upsert
      if (toUpsert.length > 0) {
        const { error } = await supabase.from('onboardings').upsert(toUpsert, { onConflict: 'wallet_address' });
        if (error) throw error;
      }

      // Retrieve the complete set of onboardings from Supabase
      const { data: allOnboardings, error: fetchError } = await supabase.from('onboardings').select('*');
      if (fetchError) throw fetchError;
      
      const onboardings = allOnboardings || [];
      syncOnboardingsToDisk(onboardings);

      return NextResponse.json({ success: true, onboardings });
    }

    // Fallback: Local Filesystem logic
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

    if (existingOnboardings.length === 0) {
      existingOnboardings = [];
    }

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
          joined_at: existingOnboardings[index].joined_at
        };
      } else {
        existingOnboardings.push(parsedOnb);
      }
    });

    syncOnboardingsToDisk(existingOnboardings);
    return NextResponse.json({ success: true, onboardings: existingOnboardings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
