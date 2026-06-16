'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  Award, 
  Star, 
  ShieldCheck, 
  FileText, 
  HelpCircle,
  ThumbsUp,
  AlertTriangle,
  User
} from 'lucide-react';

export default function Reputation() {
  const { address, connected, userProfile } = useStellar();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (address) {
      setReviews(mockDb.getReviews().filter(r => r.target_address === address));
    }
  }, [address]);

  // Calculations
  const trustScore = userProfile?.trust_score ?? 50;
  const rating = userProfile?.rating ?? 0.00;
  const completedCount = reviews.length;
  
  const getRatingStars = (val: number) => {
    const stars = [];
    const floor = Math.floor(val);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${
            i <= floor 
              ? 'text-yellow-400 fill-yellow-400' 
              : i - 0.5 <= val 
                ? 'text-yellow-400 fill-yellow-400 opacity-60' 
                : 'text-slate-600'
          }`} 
        />
      );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-cyan-400';
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 85) return 'shadow-[0_0_20px_rgba(6,182,212,0.3)] border-cyan-500/50';
    if (score >= 70) return 'shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500/50';
    if (score >= 50) return 'shadow-[0_0_20px_rgba(234,179,8,0.3)] border-yellow-500/50';
    return 'shadow-[0_0_20px_rgba(239,68,68,0.3)] border-rose-500/50';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Trust Engine Credentials</h1>
          <p className="text-slate-400 text-sm">Decentralized reputation analysis calculated live from Soroban events.</p>
        </div>

        {!connected ? (
          <div className="text-center py-20 glass-panel border border-white/5 rounded-2xl space-y-3">
            <Award className="h-12 w-12 text-cyan-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Connect Wallet to view reputation details</h2>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              On-chain reputation logs are resolved dynamically based on your Stellar credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Score Ring / Gauge */}
            <div className={`glass-panel border p-8 rounded-2xl flex flex-col items-center justify-between space-y-6 transition-all duration-300 ${getScoreGlow(trustScore)}`}>
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calculated Score</span>
                <h3 className="text-lg font-bold text-slate-200">On-Chain Trust Score</h3>
              </div>

              {/* Gauge Gauge Circle */}
              <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-4 border-slate-900 bg-slate-950/60 shadow-inner">
                <div className="text-center space-y-1.5">
                  <span className={`text-5xl font-extrabold block tracking-tighter ${getScoreColor(trustScore)}`}>
                    {trustScore}
                  </span>
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block tracking-widest">Index rating</span>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 max-w-[200px] leading-relaxed">
                {trustScore >= 85 ? (
                  <span>Verified Top-Tier Account. Eligible for premium payouts and low-fee transactions.</span>
                ) : trustScore >= 70 ? (
                  <span>Established Trust Account. Active milestone track history with zero dispute lost.</span>
                ) : (
                  <span>Standard Initial Account. Complete first agreements to increment rating metrics.</span>
                )}
              </div>
            </div>

            {/* Reputation breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Average Stars */}
                <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Average Rating</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-extrabold text-slate-150">{rating.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm">/ 5.0</span>
                  </div>
                  <div>
                    {getRatingStars(rating)}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Aggregated rating score generated from reviews left by clients and contractors.
                  </p>
                </div>

                {/* Score Formula details */}
                <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Score Algorithm Factors</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Base Trust Multiplier</span>
                      <span className="font-bold text-slate-350">+50 Points</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Completed Projects (+2 each)</span>
                      <span className="font-bold text-cyan-400">+{completedCount * 2} Points</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Avg Rating Coefficient (+5/star)</span>
                      <span className="font-bold text-purple-400">+{Math.round(rating * 5)} Points</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Verification Oracle status</span>
                      <span className="font-bold text-emerald-400">{userProfile?.verified ? '+10 Points' : '0 Points'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Review History Logs */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Decentralized Review Registry ({reviews.length})</h3>

                {reviews.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500">No review logs registered on-chain for this wallet address.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="glass-panel border border-white/5 rounded-2xl p-5 space-y-3 hover:border-cyan-500/10 transition-all">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-1.5 text-slate-350">
                            <User className="h-4 w-4 text-cyan-400" />
                            <span className="font-mono">{r.author_address.substring(0, 8)}...{r.author_address.substring(r.author_address.length - 8)}</span>
                          </div>
                          <div>
                            {getRatingStars(r.rating)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic">
                          "{r.comment || 'No comment provided.'}"
                        </p>
                        <span className="text-[10px] text-slate-500 block text-right">
                          Registered: {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
