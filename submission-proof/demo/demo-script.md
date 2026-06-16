# 🎬 Demo Video Narration Script

This script coordinates the voiceover and screencast progression for the StellarTrust pitch and demo recording.

*   **Target Length**: 3–5 Minutes
*   **Roles Needed**: 1 Narrator / Tester

---

## 🎬 Act I: Introduction & Problem Statement (0:00 - 0:45)
*   **Visual**: Show landing page. Scroll smoothly to hero header and metrics banner.
*   **Audio (Narration)**:
    > "Welcome to StellarTrust, a decentralized trust and payment protocol designed for global freelancers and clients.
    > Traditional platforms charge massive commissions, hold payouts arbitrarily, and lock professionals into proprietary silos. 
    > StellarTrust replaces these intermediaries with Soroban smart contracts. We ensure that payment is locked securely in escrow, milestone work is verified transparently on-chain, and reviews automatically generate immutable trust credentials and completion badge NFTs."

---

## 🎬 Act II: Wallet Connect & Identity Setup (0:45 - 1:30)
*   **Visual**: Click **Connect Wallet** in the header. Choose Freighter. The browser wallet pop-up triggers and is signed. Show navigation to the user profile settings page.
*   **Audio (Narration)**:
    > "To begin, I will connect my Freighter wallet on Stellar Testnet. Once authenticated, we land on our dashboard.
    > For new users, we complete the onboarding wizard. Here, I submit my username, bio, and role preferences.
    > The 'register_user' Soroban call writes my profile to the identity contract. When I sign, my profile is officially initialized on-chain, giving me full ownership of my career identity."

---

## 🎬 Act III: Creating Escrow & Locking Payouts (1:30 - 2:30)
*   **Visual**: Navigate to **Escrow Portal**. Fill in the agreement form for a mock freelancer: amount 500 XLM, 2 Milestones. Click **Create Agreement**, approve contract pop-up. Show the detail screen and click **Lock Funds**.
*   **Audio (Narration)**:
    > "Now, as a client, I will create a project agreement for a freelancer. I specify the budget, milestone stages, and the freelancer's wallet address.
    > When I submit, the Escrow Contract creates a new unique state. 
    > To protect both parties, I lock the funds into the escrow contract. The tokens are now held securely in the contract address, verify-backed by on-chain rules."

---

## 🎬 Act IV: Acceptance, Submission, & Milestone Payout (2:30 - 3:30)
*   **Visual**: Switch address context (e.g., in Freighter or Sandbox simulator). Freelancer dashboard accepts the invitation. Freelancer clicks **Submit Deliverable** for Milestone 1. Switch back to Client, click **Approve work** and **Release Payout**.
*   **Audio (Narration)**:
    > "On the freelancer's dashboard, the invitation is accepted. As milestone milestones are hit, the freelancer uploads work deliverables and flags them as submitted.
    > The client reviews the submission directly. Once satisfied, the client approves the work. 
    > By clicking 'Release Payout', the contract transfers the milestone's segment directly to the freelancer's wallet. On the final milestone, the contract automatically sweeps all remaining balance, preventing any leftover dust locks."

---

## 🎬 Act V: Reputation Scoring & NFT badges (3:30 - END)
*   **Visual**: Click **Submit Review**, select 5-star rating, write positive comment, approve. Show the Reputation score updating. Open the NFT Gallery, click **Mint Certificate**, and showcase the beautiful SVG certificate badge loaded with hashes.
*   **Audio (Narration)**:
    > "With the project successfully completed, the client leaves a review rating. The Reputation Contract aggregates the scores, scaling calculations on-chain to protect precision.
    > Finally, the freelancer mints their Achievement NFT. This certificate is stored permanently, referencing the project metadata and deliverable hash. 
    > StellarTrust establishes a secure, intermediate-free future for global freelancing. Thank you."
