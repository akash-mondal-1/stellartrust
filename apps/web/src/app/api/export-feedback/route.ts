import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';


// Helper to write feedbacks to local JSON, CSV, and markdown files on disk
function syncFeedbacksToDisk(feedbacks: any[]) {
  try {
    const jsonPath = path.resolve(process.cwd(), 'feedbacks.json');
    fs.writeFileSync(jsonPath, JSON.stringify(feedbacks, null, 2), 'utf8');

    // Build CSV Content for Blue Belt evidence
    const csvHeaders = ['id', 'name', 'email', 'wallet_address', 'rating', 'feedback_text', 'feature_request', 'created_at'];
    const csvRows = feedbacks.map((fb: any) => {
      const id = fb.id || '';
      const name = fb.name || '';
      const email = fb.email || '';
      const wallet_address = fb.user_address || fb.wallet_address || '';
      const rating = fb.rating || 5;
      const feedback_text = fb.comment || fb.feedback_text || '';
      const feature_request = fb.feature_request || '';
      const created_at = fb.created_at || '';
      return [id, name, email, wallet_address, rating, feedback_text, feature_request, created_at];
    });

    const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n') + '\n';

    // Target path: submission-proof/user-testing/blue-belt-feedback.csv
    const csvTargetPath = path.resolve(process.cwd(), '../../submission-proof/user-testing/blue-belt-feedback.csv');
    const csvDir = path.dirname(csvTargetPath);
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }
    fs.writeFileSync(csvTargetPath, csvContent, 'utf8');

    // Group feedbacks based on keywords and ratings for markdown summary
    const positive: string[] = [];
    const negative: string[] = [];
    const bugs: string[] = [];
    const features: string[] = [];
    const resolved: string[] = [];

    feedbacks.forEach((fb: any) => {
      const comment = fb.comment || fb.feedback_text || '';
      const category = fb.category || '';
      const rating = fb.rating || 5;
      const user = fb.user_address || fb.wallet_address || 'Unknown';
      const date = fb.created_at ? new Date(fb.created_at).toLocaleDateString() : new Date().toLocaleDateString();

      const entry = `*   **${user.substring(0, 8)}... (${date})** [Rating: ${rating}★]: "${comment}"`;

      if (category === 'Vulnerabilities Found' || comment.toLowerCase().includes('bug') || comment.toLowerCase().includes('error')) {
        bugs.push(entry);
      } else if (comment.toLowerCase().includes('should') || comment.toLowerCase().includes('suggest') || comment.toLowerCase().includes('improve') || comment.toLowerCase().includes('feature') || fb.feature_request) {
        features.push(entry);
      } else if (rating <= 2) {
        negative.push(entry);
      } else {
        positive.push(entry);
      }
    });

    const markdownContent = `# 💬 User Feedback Summary

This document aggregates the actual feedback collected from users during the active testing sessions.

---

## 👥 User Count
*   **Total Feedback Submissions**: ${feedbacks.length}
*   **Unique Wallet Addresses**: ${Array.from(new Set(feedbacks.map(f => f.user_address || f.wallet_address))).length}

---

## 🌟 Positive Feedback
${positive.length > 0 ? positive.join('\n') : '*   *No positive feedback registered.*'}

---

## ⚠️ Negative Feedback
${negative.length > 0 ? negative.join('\n') : '*   *No negative feedback registered.*'}

---

## 🐛 Bugs Found
${bugs.length > 0 ? bugs.join('\n') : '*   *No bugs reported.*'}

---

## 💡 Feature Requests & Suggested Improvements
${features.length > 0 ? features.join('\n') : '*   *No feature requests registered.*'}

---

## 🔧 Resolved Items
${resolved.length > 0 ? resolved.join('\n') : '*   *No items marked as resolved.*'}
`;

    const targetPath = path.resolve(process.cwd(), '../../submission-proof/user-testing/feedback-summary.md');
    fs.writeFileSync(targetPath, markdownContent, 'utf8');
  } catch (fsError) {
    console.warn("Failed to write feedback to local filesystem (likely Vercel env):", fsError);
  }
}

// GET: Retrieve all aggregated feedbacks from disk
export async function GET() {
  try {
    const hasKeys = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasKeys) {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('feedbacks').select('*');
      if (error) throw error;
      const feedbacks = data || [];
      syncFeedbacksToDisk(feedbacks);
      return NextResponse.json(feedbacks);
    }

    const jsonPath = path.resolve(process.cwd(), 'feedbacks.json');
    let feedbacks = [];
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      try {
        feedbacks = JSON.parse(data);
      } catch (e) {
        feedbacks = [];
      }
    }
    return NextResponse.json(feedbacks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add new feedbacks, merge them with existing ones, and regenerate markdown summary
export async function POST(request: Request) {
  try {
    const { feedbacks: incomingFeedbacks } = await request.json();
    if (!incomingFeedbacks || !Array.isArray(incomingFeedbacks)) {
      return NextResponse.json({ error: 'Invalid feedbacks array' }, { status: 400 });
    }

    const hasKeys = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasKeys) {
      const { supabase } = await import('@/lib/supabase');
      const toInsert = incomingFeedbacks.map((fb: any) => ({
        id: fb.id || Math.random().toString(36).substring(2, 11),
        user_address: fb.user_address || fb.wallet_address || '',
        rating: fb.rating || 5,
        comment: fb.comment || fb.feedback_text || '',
        category: fb.category || '',
        name: fb.name || '',
        email: fb.email || '',
        feature_request: fb.feature_request || '',
        created_at: fb.created_at || new Date().toISOString()
      }));

      if (toInsert.length > 0) {
        const { error } = await supabase.from('feedbacks').upsert(toInsert, { onConflict: 'id' });
        if (error) throw error;
      }

      // Query the COMPLETE set of feedbacks from Supabase
      const { data: allFeedbacks, error: fetchError } = await supabase.from('feedbacks').select('*');
      if (fetchError) throw fetchError;

      const feedbacks = allFeedbacks || [];
      syncFeedbacksToDisk(feedbacks);

      return NextResponse.json({ success: true, feedbacks });
    }

    const jsonPath = path.resolve(process.cwd(), 'feedbacks.json');
    let existingFeedbacks: any[] = [];
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      try {
        existingFeedbacks = JSON.parse(data);
      } catch (e) {
        existingFeedbacks = [];
      }
    }

    // Merge incoming feedbacks into existing feedbacks on disk by ID
    incomingFeedbacks.forEach((fb: any) => {
      if (!fb.id) {
        fb.id = Math.random().toString(36).substring(2, 11);
      }
      if (!fb.created_at) {
        fb.created_at = new Date().toISOString();
      }
      const exists = existingFeedbacks.some((existing: any) => existing.id === fb.id);
      if (!exists) {
        existingFeedbacks.push(fb);
      }
    });

    syncFeedbacksToDisk(existingFeedbacks);
    return NextResponse.json({ success: true, feedbacks: existingFeedbacks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
