const fs = require('fs');
const file = './feedbacks.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const huseyin = data.find(f => f.id === 'fb_real_2' || f.email === 'huseyintaskinn023@gmail.com');
if (huseyin) {
  huseyin.comment = "I tested the platform by connecting my wallet and creating a 'Work Agreement' (escrow). The workflow of setting up the contract and approving the milestones worked smoothly, and I successfully completed the job myself as a test. The UI looks very modern and professional. However, the transaction processing and page updates (Stellar Testnet contract execution) felt a bit slow during the process.";
  huseyin.feature_request = "1. Improved Loading States: Add clearer progress indicators or optimistic UI updates during Stellar contract transactions to make the platform feel faster and more responsive.\n2. Notification System: Implement email or in-app notifications to alert users when a milestone is submitted, approved, or funded.";
}

const guntur = data.find(f => f.email === 'mgsdilah777@gmail.com');
if (!guntur) {
  data.push({
    id: "fb_real_6",
    name: "Muhammad guntur sa'dillah",
    email: "mgsdilah777@gmail.com",
    user_address: "GDFFR6V53O4MASRZ7WS5MSKLBDDU3AMKBCJLTB52V5JR4FZKDWVBZZB7",
    rating: 4,
    comment: "Nice",
    feature_request: "No idea",
    category: "UI/UX Usability",
    created_at: new Date().toISOString()
  });
}

const sadiya = data.find(f => f.email === 'sadiyamulani03@gmail.com');
if (!sadiya) {
  data.push({
    id: "fb_real_7",
    name: "Sadiya Mulani",
    email: "sadiyamulani03@gmail.com",
    user_address: "GBTCGV43NLHEEBMCA5DWFZT6GOJYYCPHXNOEALTBQ7TREIQKQQAVLYT4",
    rating: 5,
    comment: "All good",
    feature_request: "Adding a one-click backup and restore for settings so users can recover their preferences instantly would be",
    category: "UI/UX Usability",
    created_at: new Date().toISOString()
  });
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
