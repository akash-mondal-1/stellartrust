import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { feedbacks } = await request.json();
    if (!feedbacks || !Array.isArray(feedbacks)) {
      return NextResponse.json({ error: 'Invalid feedbacks array' }, { status: 400 });
    }

    const positive: string[] = [];
    const negative: string[] = [];
    const bugs: string[] = [];
    const features: string[] = [];
    const resolved: string[] = [];

    feedbacks.forEach((fb: any) => {
      const comment = fb.comment || '';
      const category = fb.category || '';
      const rating = fb.rating || 5;
      const user = fb.user_address || 'Unknown';
      const date = fb.created_at ? new Date(fb.created_at).toLocaleDateString() : new Date().toLocaleDateString();

      const entry = `*   **${user.substring(0, 8)}... (${date})** [Rating: ${rating}★]: "${comment}"`;

      // Group feedback based on keywords and ratings
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
*   **Total Feedback Submissions**: ${feedbacks.length}
*   **Unique Wallet Addresses**: ${Array.from(new Set(feedbacks.map(f => f.user_address))).length}

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

    return NextResponse.json({ success: true, path: targetPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
