const fs = require('fs');
const path = require('path');

const feedbacksPath = path.resolve(__dirname, '../apps/web/feedbacks.json');
if (!fs.existsSync(feedbacksPath)) {
  console.error("feedbacks.json not found!");
  process.exit(1);
}

const feedbacks = JSON.parse(fs.readFileSync(feedbacksPath, 'utf8'));
console.log(`Loaded ${feedbacks.length} feedbacks from feedbacks.json.`);

// 1. Build CSV Content
const csvHeaders = ['id', 'name', 'email', 'wallet_address', 'rating', 'feedback_text', 'feature_request', 'created_at'];
const csvRows = feedbacks.map((fb) => {
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

const csvContent = [
  csvHeaders.join(','), 
  ...csvRows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
].join('\n') + '\n';

const csvTargetPath = path.resolve(__dirname, '../submission-proof/user-testing/blue-belt-feedback.csv');
const csvDir = path.dirname(csvTargetPath);
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}
fs.writeFileSync(csvTargetPath, csvContent, 'utf8');
console.log(`Generated ${csvTargetPath}`);

// 2. Build Markdown Content
const positive = [];
const negative = [];
const bugs = [];
const features = [];
const resolved = [];

feedbacks.forEach((fb) => {
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

const mdTargetPath = path.resolve(__dirname, '../submission-proof/user-testing/feedback-summary.md');
fs.writeFileSync(mdTargetPath, markdownContent, 'utf8');
console.log(`Generated ${mdTargetPath}`);
