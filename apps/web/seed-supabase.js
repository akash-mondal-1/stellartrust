// seed-supabase.js
// Run: node seed-supabase.js
// Seeds all local JSON data into Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://kiquignorpbkvdhrkzyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXVpZ25vcnBia3ZkaHJrenlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTQ2MTYsImV4cCI6MjA5ODg5MDYxNn0.uGmSg01TGJJu0C2tPOw5qUZ5YCXoPVKmGqjd8qLdGmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedFeedbacks() {
  const raw = fs.readFileSync(path.join(__dirname, 'feedbacks.json'), 'utf8');
  const feedbacks = JSON.parse(raw);
  console.log(`\n📋 Seeding ${feedbacks.length} feedbacks...`);

  // Check existing
  const { data: existing } = await supabase.from('feedbacks').select('id');
  const existingIds = new Set((existing || []).map(e => e.id));

  const toInsert = feedbacks
    .filter(fb => fb.user_address || fb.wallet_address)
    .filter(fb => !existingIds.has(fb.id))
    .map(fb => ({
      id: fb.id,
      user_address: fb.user_address || fb.wallet_address || '',
      rating: fb.rating || 5,
      comment: fb.comment || fb.feedback_text || '',
      category: fb.category || '',
      name: fb.name || '',
      email: fb.email || '',
      feature_request: fb.feature_request || '',
      created_at: fb.created_at || new Date().toISOString()
    }));

  if (toInsert.length === 0) {
    console.log('  ✅ All feedbacks already in Supabase, skipping.');
    return;
  }

  const { error } = await supabase.from('feedbacks').insert(toInsert);
  if (error) {
    console.error('  ❌ Error inserting feedbacks:', error.message);
    // Try one by one
    let inserted = 0;
    for (const fb of toInsert) {
      const { error: e2 } = await supabase.from('feedbacks').upsert(fb, { onConflict: 'id' });
      if (!e2) inserted++;
      else console.warn('    Skipped:', fb.id, e2.message);
    }
    console.log(`  ✅ Inserted ${inserted}/${toInsert.length} feedbacks`);
  } else {
    console.log(`  ✅ Inserted ${toInsert.length} new feedbacks`);
  }
}

async function seedOnboardings() {
  const raw = fs.readFileSync(path.join(__dirname, 'onboardings.json'), 'utf8');
  const onboardings = JSON.parse(raw);
  console.log(`\n👤 Seeding ${onboardings.length} onboardings...`);

  const { data: existing } = await supabase.from('onboardings').select('wallet_address');
  const existingWallets = new Set((existing || []).map(e => e.wallet_address?.toLowerCase()));

  const toInsert = onboardings
    .filter(o => o.wallet_address && o.wallet_address.startsWith('G'))
    .filter(o => !existingWallets.has(o.wallet_address?.toLowerCase()))
    .map(o => ({
      id: o.id || ('onb_' + Math.random().toString(36).substring(2, 11)),
      wallet_address: o.wallet_address,
      connection_source: o.connection_source || 'freighter',
      joined_at: o.joined_at || o.created_at || new Date().toISOString(),
      first_interaction: o.first_interaction || 'wallet_connected',
      referred_by: o.referred_by || null
    }));

  if (toInsert.length === 0) {
    console.log('  ✅ All onboardings already in Supabase, skipping.');
    return;
  }

  const { error } = await supabase.from('onboardings').insert(toInsert);
  if (error) {
    console.error('  ❌ Error inserting onboardings:', error.message);
    let inserted = 0;
    for (const o of toInsert) {
      const { error: e2 } = await supabase.from('onboardings').upsert(o, { onConflict: 'wallet_address' });
      if (!e2) inserted++;
      else console.warn('    Skipped:', o.wallet_address, e2.message);
    }
    console.log(`  ✅ Inserted ${inserted}/${toInsert.length} onboardings`);
  } else {
    console.log(`  ✅ Inserted ${toInsert.length} new onboardings`);
  }
}

async function seedEvents() {
  const raw = fs.readFileSync(path.join(__dirname, 'events.json'), 'utf8');
  const events = JSON.parse(raw);
  console.log(`\n⚡ Seeding validation events... (${events.length} total, using real wallets only)`);

  const { data: existing } = await supabase.from('validation_events').select('id');
  const existingIds = new Set((existing || []).map(e => e.id));

  const realEvents = events
    .filter(e => e.wallet_address && e.wallet_address.startsWith('G') && e.wallet_address.length === 56)
    .filter(e => !existingIds.has(e.id))
    .map(e => ({
      id: e.id,
      wallet_address: e.wallet_address,
      event_type: e.event_type,
      metadata: e.metadata || {},
      created_at: e.created_at || new Date().toISOString(),
      session_id: e.session_id || 'seed'
    }));

  if (realEvents.length === 0) {
    console.log('  ✅ All events already in Supabase or no new real wallet events, skipping.');
    return;
  }

  // Insert in batches of 50 to avoid timeout
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < realEvents.length; i += BATCH) {
    const batch = realEvents.slice(i, i + BATCH);
    const { error } = await supabase.from('validation_events').insert(batch);
    if (error) {
      for (const ev of batch) {
        const { error: e2 } = await supabase.from('validation_events').upsert(ev, { onConflict: 'id' });
        if (!e2) inserted++;
      }
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✅ Inserted ${inserted}/${realEvents.length} new validation events`);
}

async function main() {
  console.log('🚀 StellarTrust Supabase Seeder');
  console.log('================================');

  try {
    // Test connection
    const { error: connErr } = await supabase.from('feedbacks').select('id').limit(1);
    if (connErr) {
      console.error('❌ Cannot connect to Supabase:', connErr.message);
      console.log('\n💡 Make sure you have run the supabase_setup.sql script in your Supabase SQL Editor first!');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase successfully\n');

    await seedFeedbacks();
    await seedOnboardings();
    await seedEvents();

    console.log('\n🎉 Seeding complete! Your Supabase database now has all the latest data.');
    console.log('\nNext step: Add these to Vercel Environment Variables:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL =', SUPABASE_URL);
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY = [your key]');
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
