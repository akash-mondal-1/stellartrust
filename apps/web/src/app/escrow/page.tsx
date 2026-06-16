'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  FileText, 
  User, 
  Calendar, 
  Coins, 
  Layers, 
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  DollarSign,
  Plus
} from 'lucide-react';

function EscrowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const { 
    address, 
    connected, 
    createAgreement, 
    fundEscrow, 
    acceptAgreement, 
    submitWork, 
    approveWork, 
    releasePayment, 
    raiseDispute, 
    refundClient,
    submitReview,
    mintNFT
  } = useStellar();

  // Creation form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [freelancer, setFreelancer] = useState('');
  const [amount, setAmount] = useState(100);
  const [milestonesCount, setMilestonesCount] = useState(1);
  const [deadlineDays, setDeadlineDays] = useState(14);
  const [creating, setCreating] = useState(false);

  // Active agreement details
  const [agreement, setAgreement] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // NFT state
  const [nftMinted, setNftMinted] = useState(false);

  // Load details
  const loadAgreementDetails = () => {
    if (id) {
      setLoading(true);
      const ag = mockDb.getAgreement(id);
      if (ag) {
        setAgreement(ag);
        setMilestones(mockDb.getAgreementMilestones(id));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreementDetails();

    if (id) {
      // Poll details
      const interval = setInterval(() => {
        const ag = mockDb.getAgreement(id);
        if (ag) {
          setAgreement(ag);
          setMilestones(mockDb.getAgreementMilestones(id));
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !address) return;
    if (!title.trim() || !freelancer.trim()) return;

    setCreating(true);
    try {
      const newAg = await createAgreement(title, description, freelancer, amount, milestonesCount, deadlineDays);
      router.push(`/escrow?id=${newAg.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (actionFn: () => Promise<any>) => {
    if (!agreement) return;
    setActionLoading(true);
    try {
      await actionFn();
      loadAgreementDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) return;
    setActionLoading(true);
    try {
      await submitReview(agreement.id, rating, reviewComment);
      setReviewSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!agreement) return;
    setActionLoading(true);
    try {
      await mintNFT(agreement.id, agreement.freelancer_address, agreement.title);
      setNftMinted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const isClient = agreement?.client_address === address;
  const isFreelancer = agreement?.freelancer_address === address;

  const currentMilestoneIndex = milestones.findIndex(m => m.status !== 'Released');

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
      
      {!id ? (
        /* Create Escrow View */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Create Work Agreement</h1>
            <p className="text-slate-400 text-sm">Lock payments securely in a Soroban escrow contract before starting work.</p>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Website Redesign & Frontend Implementation"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deliverable details and expectations..."
                  rows={3}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Freelancer Wallet Address</label>
                  <input
                    type="text"
                    required
                    value={freelancer}
                    onChange={(e) => setFreelancer(e.target.value)}
                    placeholder="GD2...N4J"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Amount (XLM)</label>
                  <div className="relative">
                    <Coins className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Milestones count</label>
                  <select
                    value={milestonesCount}
                    onChange={(e) => setMilestonesCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>{v} Milestone{v > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Deadline (Days)</label>
                  <input
                    type="number"
                    required
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating || !connected}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-sm rounded-xl hover:opacity-90 shadow-lg transition-all disabled:opacity-50"
              >
                {creating ? 'Registering Agreement...' : 'Initialize On-Chain Escrow'}
              </button>

            </form>
          </div>
        </div>
      ) : (
        /* Manage Escrow details */
        loading || !agreement ? (
          <div className="text-center py-20 animate-pulse space-y-4">
            <div className="h-10 w-48 bg-slate-900 mx-auto rounded" />
            <div className="h-40 w-full bg-slate-900 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header Info */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">{agreement.title}</h2>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Status: {agreement.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{agreement.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase">Client Wallet</span>
                    <span className="font-mono text-slate-300">
                      {agreement.client_address.substring(0, 10)}...{agreement.client_address.substring(agreement.client_address.length - 8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase">Freelancer Wallet</span>
                    <span className="font-mono text-slate-300">
                      {agreement.freelancer_address?.substring(0, 10)}...{agreement.freelancer_address?.substring(agreement.freelancer_address.length - 8) || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-slate-500 font-semibold block uppercase">Deadline</span>
                    <span className="text-slate-300">{new Date(agreement.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Milestones Check list */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                  <Layers className="h-4.5 w-4.5 text-cyan-400" />
                  <span>Agreement Milestones Payout Schedule</span>
                </h3>

                <div className="space-y-3">
                  {milestones.map((m, idx) => (
                    <div 
                      key={m.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        m.status === 'Released' 
                          ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400' 
                          : m.status === 'Submitted'
                            ? 'bg-purple-950/20 border-purple-800/30 text-purple-400'
                            : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider block">Milestone {idx + 1}</span>
                        <h4 className="font-bold text-sm text-slate-100">{m.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-200 block">{m.amount} XLM</span>
                        <span className="text-[10px] uppercase font-bold block">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review block if released */}
              {agreement.status === 'Released' && (
                <div className="glass-panel border border-cyan-500/20 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                    <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
                    <span>On-Chain Feedback & Review Registry</span>
                  </h3>
                  
                  {reviewSubmitted ? (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 rounded-xl text-xs font-bold">
                      Thank you! Your feedback has been registered on-chain and added to their trust rating score.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 block uppercase">Rating (1 to 5 Stars)</label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300"
                        >
                          {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 block uppercase">Comment</label>
                        <textarea
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Outstanding execution! Very quick turn-around."
                          rows={2.5}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="py-2 px-4 bg-cyan-500 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        Register Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Status Actions */}
            <div className="space-y-6">
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Contract Funds</span>
                  <p className="text-3xl font-extrabold text-slate-100">{agreement.amount} XLM</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Available Actions</h4>
                  
                  {/* Client actions */}
                  {isClient && agreement.status === 'Created' && (
                    <button
                      onClick={() => handleAction(() => fundEscrow(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-3 bg-cyan-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Fund Escrow Payouts
                    </button>
                  )}

                  {isClient && agreement.status === 'Submitted' && (
                    <button
                      onClick={() => handleAction(() => approveWork(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-3 bg-emerald-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Approve Deliverables
                    </button>
                  )}

                  {isClient && agreement.status === 'Approved' && (
                    <button
                      onClick={() => handleAction(() => releasePayment(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Release Milestone Payment
                    </button>
                  )}

                  {/* Freelancer actions */}
                  {isFreelancer && agreement.status === 'Funded' && (
                    <button
                      onClick={() => handleAction(() => acceptAgreement(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-3 bg-indigo-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Accept Project Agreement
                    </button>
                  )}

                  {isFreelancer && ['Accepted', 'Approved'].includes(agreement.status) && currentMilestoneIndex >= 0 && (
                    <button
                      onClick={() => handleAction(() => submitWork(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-3 bg-purple-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Submit Milestone Work
                    </button>
                  )}

                  {/* NFT Minting */}
                  {isFreelancer && agreement.status === 'Released' && (
                    nftMinted ? (
                      <div className="p-3 bg-slate-900 border border-cyan-800/30 text-cyan-400 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5">
                        <Award className="h-4.5 w-4.5 fill-cyan-400" />
                        <span>NFT Certificate Claimed!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleMintNFT}
                        disabled={actionLoading}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5"
                      >
                        <Award className="h-4.5 w-4.5" />
                        <span>Claim Achievement NFT</span>
                      </button>
                    )
                  )}

                  {/* Dispute & refund button */}
                  {['Accepted', 'Submitted', 'Approved'].includes(agreement.status) && (
                    <button
                      onClick={() => handleAction(() => raiseDispute(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-slate-900 border border-rose-800/30 text-rose-400 hover:bg-rose-950/20 font-bold text-xs rounded-xl transition-all"
                    >
                      Raise Payout Dispute
                    </button>
                  )}

                  {agreement.status === 'Disputed' && (
                    <button
                      onClick={() => handleAction(() => refundClient(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Authorize Refund (Referee Release)
                    </button>
                  )}

                  {/* If not involved */}
                  {!isClient && !isFreelancer && (
                    <div className="p-3 bg-slate-900/60 text-slate-500 text-xs rounded-xl border border-white/5 text-center">
                      Connected wallet is not authorized to act on this contract.
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )
      )}
    </main>
  );
}

export default function Escrow() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-900 rounded" />
          <div className="h-64 bg-slate-900 rounded-2xl" />
        </div>
      }>
        <EscrowContent />
      </Suspense>
      <Footer />
    </div>
  );
}
