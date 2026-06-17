'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  User,
  ArrowRight
} from 'lucide-react';

export default function Reputation() {
  const { address, connected, userProfile, isDemo, submitReview, discoverAndSyncReviews } = useStellar();
  const [reviews, setReviews] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);

  // Form states
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>('');
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reloadData = () => {
    if (address) {
      setReviews(mockDb.getReviews().filter(r => r.target_address?.toLowerCase() === address.toLowerCase()));
      setAgreements(mockDb.getAgreements().filter(a => a.client_address?.toLowerCase() === address.toLowerCase() || a.freelancer_address?.toLowerCase() === address.toLowerCase()));
    }
  };

  useEffect(() => {
    reloadData();

    if (address && connected) {
      // Periodically sync reviews on-chain
      if (!isDemo && discoverAndSyncReviews) {
        discoverAndSyncReviews().then(() => {
          reloadData();
        });
      }

      const interval = setInterval(async () => {
        if (!isDemo && discoverAndSyncReviews) {
          try {
            await discoverAndSyncReviews();
          } catch (e) {}
        }
        reloadData();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [address, connected, isDemo]);

  // Calculations
  const trustScore = userProfile?.trust_score ?? 50;
  const rating = userProfile?.rating ?? 0.00;
  const completedCount = reviews.length;
  
  const allReviews = mockDb.getReviews();
  const userHasReviewed = (agreementId: string) => {
    return allReviews.some((r: any) => r.agreement_id === agreementId && r.author_address?.toLowerCase() === address?.toLowerCase());
  };

  const eligibleAgreements = agreements.filter(a => 
    a.status === 'Released' && !userHasReviewed(a.id)
  );

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreementId) return;
    setSubmittingReview(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await submitReview(selectedAgreementId, ratingInput, commentInput);
      setSuccessMessage('Feedback submitted successfully! The collaborator\'s rating and Trust Score have been updated.');
      setSelectedAgreementId('');
      setCommentInput('');
      setRatingInput(5);
      reloadData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };
  
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

              <div className="w-full border-t border-white/5 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Reviews Received</span>
                  <span className="font-bold text-slate-200">{completedCount}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Average Rating</span>
                  <span className="font-bold text-slate-200">{rating.toFixed(2)} / 5.0</span>
                </div>
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

              {/* Review Submission Section */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                  <ThumbsUp className="h-4.5 w-4.5 text-cyan-400" />
                  <span>Leave Feedback for Collaborators</span>
                </h3>

                {eligibleAgreements.length === 0 ? (
                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                    <p>No projects are currently pending your feedback.</p>
                    <p className="text-slate-500">
                      To submit on-chain feedback: Complete an escrow agreement, ensure payments are released, then return here to rate your partner's performance.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {successMessage && (
                      <div className="p-3 bg-emerald-950/45 border border-emerald-800/40 text-emerald-400 rounded-xl text-xs font-bold">
                        {successMessage}
                      </div>
                    )}
                    {errorMessage && (
                      <div className="p-3 bg-rose-950/45 border border-rose-800/40 text-rose-400 rounded-xl text-xs font-bold">
                        {errorMessage}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase block tracking-wider">Select Completed Project</label>
                        <select
                          value={selectedAgreementId}
                          onChange={(e) => setSelectedAgreementId(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">-- Choose project --</option>
                          {eligibleAgreements.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.title} ({a.amount} XLM) - Partner: {address?.toLowerCase() === a.client_address?.toLowerCase() ? 'Freelancer' : 'Client'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase block tracking-wider">Rating</label>
                        <select
                          value={ratingInput}
                          onChange={(e) => setRatingInput(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500"
                        >
                          {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase block tracking-wider">Review Comments</label>
                      <textarea
                        required
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Outstanding execution! Very quick turn-around."
                        rows={2}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="py-2.5 px-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {submittingReview ? 'Registering feedback...' : 'Submit On-Chain Review'}
                    </button>
                  </form>
                )}
              </div>

              {/* Active Agreements checklist/helper */}
              {agreements.filter(a => a.status !== 'Released' && a.status !== 'Cancelled').length > 0 && (
                <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                    <FileText className="h-4.5 w-4.5 text-yellow-500" />
                    <span>Your Active/In-Progress Projects</span>
                  </h3>
                  <div className="space-y-3">
                    {agreements.filter(a => a.status !== 'Released' && a.status !== 'Cancelled').map(a => (
                      <div key={a.id} className="flex justify-between items-center bg-slate-900/30 border border-white/5 p-3.5 rounded-xl text-xs">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-200">{a.title}</h4>
                          <div className="flex space-x-2 text-slate-500">
                            <span>Status: <strong className="text-yellow-500/80">{a.status}</strong></span>
                            <span>•</span>
                            <span>Role: <strong>{address?.toLowerCase() === a.client_address?.toLowerCase() ? 'Client' : 'Freelancer'}</strong></span>
                          </div>
                        </div>
                        <Link 
                          href={`/escrow?id=${a.id}`}
                          className="px-3 py-1.5 bg-slate-800 border border-white/10 text-cyan-400 hover:text-cyan-300 font-bold rounded-lg transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      <div key={r.id} className="glass-panel border border-white/5 rounded-2xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start text-xs gap-4">
                          <div className="space-y-1">
                            <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Reviewer Address</span>
                            <div className="flex items-center space-x-1.5 text-slate-200">
                              <User className="h-3.5 w-3.5 text-cyan-400" />
                              <span className="font-mono select-all break-all">{r.author_address}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end gap-1.5">
                            {getRatingStars(r.rating)}
                            <span className="text-[10px] text-slate-500 block">
                              Registered: {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-950/45 border border-white/5 rounded-xl p-3">
                          <p className="text-xs text-slate-300 italic">
                            "{r.comment || 'No comment provided.'}"
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2 text-slate-500">
                          <span>Agreement Ref: #{r.agreement_id}</span>
                          {r.tx_hash ? (
                            <a 
                              href={`https://stellar.expert/explorer/testnet/tx/${r.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 hover:underline"
                            >
                              <span>Tx: {r.tx_hash.substring(0, 8)}...{r.tx_hash.substring(r.tx_hash.length - 8)}</span>
                            </a>
                          ) : (
                            <span className="font-mono text-slate-600">Tx: Local Consensus</span>
                          )}
                        </div>
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
