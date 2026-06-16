'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  Database, 
  Trash2, 
  Droplet, 
  UserCheck, 
  MessageSquare, 
  Award,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function AdminPanel() {
  const { address, connected, refreshProfile } = useStellar();

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('UI/UX Usability');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const loadData = () => {
    setFeedbacks(mockDb.getFeedback());
    setLogs(mockDb.getActivityLogs());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedData = () => {
    // Seed profiles
    const mockProfiles = [
      { id: 'GDEALER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT', username: 'alice_client', bio: 'Startup founder looking for Rust developers.', role: 'client', verified: true, rating: 4.8, trust_score: 96 },
      { id: 'GFREELANCER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GFREELANCER', username: 'bob_freelancer', bio: 'Stellar Soroban wizard. Specializing in Rust smart contracts.', role: 'freelancer', verified: true, rating: 4.9, trust_score: 98 },
      { id: 'GDESIGNER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GDESIGNER', username: 'charlie_designer', bio: 'UI/UX specialist. Converting Figma into Tailwind code.', role: 'freelancer', verified: false, rating: 4.2, trust_score: 72 },
    ];
    mockProfiles.forEach(p => mockDb.upsertProfile(p));

    // Seed agreements
    const mockAgreements = [
      {
        title: 'DeFi Liquidity Pool Smart Contract',
        description: 'Implement secure Soroban-based AMM pools with swap and deposit functions, including standard cargo unit testing.',
        client_address: 'GDEALER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT',
        freelancer_address: 'GFREELANCER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GFREELANCER',
        amount: '8000',
        token_address: 'CDLZFC3SYJYDZT7KMGV55XX2XZPP2D4EE3CYC5EFO7ISXYCLAT234TRZ',
        milestone_count: '2',
        status: 'Released',
        deadline: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() // completed
      },
      {
        title: 'Stellar Web3 Dashboard Implementation',
        description: 'Build a premium glassmorphic client interface in Next.js connecting to the Soroban contracts using StellarWalletsKit.',
        client_address: 'GDEALER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT',
        freelancer_address: 'GDESIGNER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GDESIGNER',
        amount: '3500',
        token_address: 'CDLZFC3SYJYDZT7KMGV55XX2XZPP2D4EE3CYC5EFO7ISXYCLAT234TRZ',
        milestone_count: '1',
        status: 'Submitted', // pending review
        deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
      }
    ];

    mockAgreements.forEach(ag => {
      const created = mockDb.createAgreement(ag);
      mockDb.updateAgreementStatus(created.id, ag.status);
    });

    // Seed Reviews
    mockDb.addReview({
      agreement_id: 'defi-mock-id',
      author_address: 'GDEALER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT',
      target_address: 'GFREELANCER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GFREELANCER',
      rating: 5,
      comment: 'Bob is an exceptional smart contract engineer. Impeccable Rust code and clean architecture!'
    });

    // Seed virtual NFTs
    if (typeof window !== 'undefined') {
      const nftKey = 'stellar_trust_nft_GFREELANCER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GFREELANCER';
      const mockNFTs = [
        {
          id: 1,
          agreement_id: 'mock-ag-1',
          freelancer: 'GFREELANCER6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GFREELANCER',
          project_name: 'DeFi Liquidity Pool Smart Contract',
          project_hash: 'SHA256-5B1D20E8AECA872F082F8E24D9E2E8FF3E11',
          completion_date: new Date().toISOString()
        }
      ];
      localStorage.setItem(nftKey, JSON.stringify(mockNFTs));
    }

    if (address) {
      refreshProfile(address);
    }
    loadData();
    alert('Mock Data successfully seeded! Dashboards are now populated with profiles, contracts, and review ratings.');
  };

  const handleReset = () => {
    if (confirm('Wipe all local storage mock data? This resets the demo ecosystem.')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        localStorage.setItem('stellar_trust_demo_mode', 'true');
        const demoClientAddress = 'GDEMOCLIENT6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT';
        localStorage.setItem('stellar_trust_wallet_address', demoClientAddress);
      }
      loadData();
      window.location.reload();
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const userAddr = address || 'G_GUEST_TESTER_WALLET';
    const newFeedback = {
      user_address: userAddr,
      rating: feedbackRating,
      comment: feedbackText,
      category: feedbackCategory
    };
    
    mockDb.addFeedback(newFeedback);

    setFeedbackText('');
    setFeedbackMessage('Feedback successfully submitted. Thank you for validating StellarTrust!');
    loadData();

    // Automate feedback-summary.md sync on disk
    const currentFeedbacks = mockDb.getFeedback();
    fetch('/api/export-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feedbacks: currentFeedbacks })
    })
    .then(res => res.json())
    .then(data => {
      console.log('✓ Feedback summary markdown synced to disk:', data);
    })
    .catch(err => {
      console.error('❌ Failed to sync feedback summary to disk:', err);
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Sandbox Testing Hub</h1>
            <p className="text-slate-400 text-sm">Control center for evaluating the MVP, seeding demo parameters, and recording validator feedback.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/validation"
              className="flex items-center space-x-1.5 bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/60 text-cyan-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Green Belt Audit Board</span>
            </Link>
            <Link
              href="/admin/submission"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/20 active:scale-95 transition-all"
            >
              <Award className="h-4.5 w-4.5 text-white" />
              <span>Evidence Submission Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Top Section - Seeding Control */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <Database className="h-6 w-6 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-200">Seed Demo Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly populate profiles, agreements, milestones, and ratings. Ideal for demonstrating flows.
              </p>
            </div>
            <button
              onClick={handleSeedData}
              className="py-2 px-4 bg-cyan-500 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all"
            >
              Populate Mock Database
            </button>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <Trash2 className="h-6 w-6 text-rose-400" />
              <h3 className="text-base font-bold text-slate-200">Reset System State</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean and wipe all localStorage keys, resetting demo profiles and logs back to default empty.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="py-2 px-4 bg-slate-900 border border-rose-800 text-rose-400 hover:bg-rose-950/20 text-xs font-bold rounded-xl transition-all"
            >
              Reset Storage Wipes
            </button>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <Droplet className="h-6 w-6 text-purple-400" />
              <h3 className="text-base font-bold text-slate-200">Faucet Simulated XLM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fund your current connected test address with mock XLM (only available in Demo Mode).
              </p>
            </div>
            <button
              onClick={() => alert('Simulated Faucet: Added 10,000 XLM into mock wallet balance!')}
              className="py-2 px-4 bg-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all"
            >
              Simulate Faucet +10K XLM
            </button>
          </div>
        </div>

        {/* Lower Section - User Validation form & Proof Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Testing Feedback Form */}
          <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              <span>Real User Validation Program Form</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Green Belt testing program targets 10+ users. Validators can submit comments, scoring ratings, and experience reports below.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300"
                  >
                    <option value="UI/UX Usability">UI/UX Usability</option>
                    <option value="On-Chain Escrows">On-Chain Escrows</option>
                    <option value="Reputation Scores">Reputation Scores</option>
                    <option value="NFT Certificates">NFT Certificates</option>
                    <option value="Vulnerabilities Found">Vulnerabilities Found</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Rating Index</label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Validator Feedback Comment</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="App is highly intuitive. Funding escrows is super smooth and local fallback simulator keeps state perfectly!"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {feedbackMessage && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs rounded-xl font-bold">
                  {feedbackMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-xs rounded-xl hover:opacity-90 shadow-lg"
              >
                Submit Validator Report
              </button>
            </form>
          </div>

          {/* Validation Proof Collection Logs */}
          <div className="space-y-6">
            
            {/* Feedback items list */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200">
                Logged Validator Feedback Reports ({feedbacks.length})
              </h3>
              
              <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1">
                {feedbacks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No validator feedback reports logged yet.</p>
                ) : (
                  feedbacks.map((fb) => (
                    <div key={fb.id} className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs space-y-2 text-slate-350">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-cyan-400">
                          {fb.user_address.substring(0, 6)}...{fb.user_address.substring(fb.user_address.length - 6)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 uppercase">
                          {fb.category}
                        </span>
                      </div>
                      <p className="italic">"{fb.comment}"</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                        <span>Rating: {fb.rating} Stars</span>
                        <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Activity logs */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200">
                On-Chain Activity Logs
              </h3>

              <div className="space-y-2.5 max-h-[170px] overflow-y-auto text-xs pr-1">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No transactions or status changes logged yet.</p>
                ) : (
                  [...logs].reverse().map((lg) => (
                    <div key={lg.id} className="flex items-start justify-between space-x-2 text-slate-400 pb-2 border-b border-white/5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-300 text-xs">{lg.description}</p>
                        <span className="text-[10px] text-slate-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(lg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-500 font-bold uppercase">{lg.action_type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
