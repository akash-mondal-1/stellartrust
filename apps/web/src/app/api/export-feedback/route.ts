import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET: Retrieve all aggregated feedbacks from disk
export async function GET() {
  try {
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

    // Write merged list to disk
    fs.writeFileSync(jsonPath, JSON.stringify(existingFeedbacks, null, 2), 'utf8');

    // Group feedbacks based on keywords and ratings for markdown summary
    const positive: string[] = [];
    const negative: string[] = [];
    const bugs: string[] = [];
    const features: string[] = [];
    const resolved: string[] = [];

    existingFeedbacks.forEach((fb: any) => {
      const comment = fb.comment || '';
      const category = fb.category || '';
      const rating = fb.rating || 5;
      const user = fb.user_address || 'Unknown';
      const date = fb.created_at ? new Date(fb.created_at).toLocaleDateString() : new Date().toLocaleDateString();

      const entry = `*   **${user.substring(0, 8)}... (${date})** [Rating: ${rating}★]: "${comment}"`;

      if (category === 'Vulnerabilities Found' || comment.toLowerCase().includes('bug') || comment.toLowerCase().includes('error')) {
        bugs.push(entry);
      } else if (comment.toLowerCase().includes('should') || comment.toLowerCase().includes('suggest') || comment.toLowerCase().includes('improve') || comment.toLowerCase().includes('feature')) {
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
*   **Total Feedback Submissions**: ${existingFeedbacks.length}
*   **Unique Wallet Addresses**: ${Array.from(new Set(existingFeedbacks.map(f => f.user_address))).length}

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

    return NextResponse.json({ success: true, path: targetPath, feedbacks: existingFeedbacks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
