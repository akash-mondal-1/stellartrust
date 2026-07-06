// update-feedbacks.js
// Patches all existing feedbacks in Supabase with name, email, feature_request fields
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://kiquignorpbkvdhrkzyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXVpZ25vcnBia3ZkaHJrenlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTQ2MTYsImV4cCI6MjA5ODg5MDYxNn0.uGmSg01TGJJu0C2tPOw5qUZ5YCXoPVKmGqjd8qLdGmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('🔄 Updating feedbacks with name/email/feature_request...\n');

  const raw = fs.readFileSync(path.join(__dirname, 'feedbacks.json'), 'utf8');
  const feedbacks = JSON.parse(raw);

  let updated = 0;
  let failed = 0;

  for (const fb of feedbacks) {
    if (!fb.id) continue;
    const { error } = await supabase
      .from('feedbacks')
      .update({
        name: fb.name || '',
        email: fb.email || '',
        feature_request: fb.feature_request || '',
        comment: fb.comment || fb.feedback_text || '',
      })
      .eq('id', fb.id);

    if (error) {
      console.warn(`  ❌ Failed [${fb.id}]:`, error.message);
      failed++;
    } else {
      console.log(`  ✅ Updated [${fb.id}] - ${fb.name || 'no name'}`);
      updated++;
    }
  }

  console.log(`\n✅ Done! Updated: ${updated}, Failed: ${failed}`);
}

main();
