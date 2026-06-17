'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
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
  Plus,
  ExternalLink
} from 'lucide-react';

function EscrowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const { 
    address, 
    connected, 
    isDemo,
    createAgreement, 
    fundEscrow, 
    acceptAgreement, 
    submitWork, 
    approveWork, 
    releasePayment, 
    raiseDispute, 
    refundClient,
    submitReview,
    mintNFT,
    syncAgreement,
    modifyAgreement,
    discoverAndSyncAgreements,
    discoverAndSyncNFTs,
    discoverAndSyncReviews
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
  const [existingReview, setExistingReview] = useState<any | null>(null);

  // NFT state
  const [nftMinted, setNftMinted] = useState(false);
  const [mintedNftId, setMintedNftId] = useState<number | null>(null);

  // Modify states
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [modifyDeadlineExtend, setModifyDeadlineExtend] = useState(7);
  const [modifyDesc, setModifyDesc] = useState('');
  const [modifyWarning, setModifyWarning] = useState<string | null>(null);

  // Agreements list for dashboard/fallback view
  const [allAgreements, setAllAgreements] = useState<any[]>([]);

  useEffect(() => {
    if (!id && address) {
      setAllAgreements(mockDb.getAgreements());
      
      if (!isDemo && discoverAndSyncAgreements) {
        discoverAndSyncAgreements(address).then(() => {
          if (discoverAndSyncNFTs) {
            discoverAndSyncNFTs().then(() => {
              setAllAgreements(mockDb.getAgreements());
            });
          } else {
            setAllAgreements(mockDb.getAgreements());
          }
        });
      }
      
      const interval = setInterval(async () => {
        if (!isDemo && discoverAndSyncAgreements) {
          try {
            await discoverAndSyncAgreements(address);
            if (discoverAndSyncNFTs) {
              await discoverAndSyncNFTs();
            }
          } catch (e) {
            console.warn("Escrow list polling sync warning:", e);
          }
        }
        setAllAgreements(mockDb.getAgreements());
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [id, address, isDemo]);

  // Load details
  const loadAgreementDetails = async () => {
    if (id) {
      setLoading(true);
      if (!isDemo && connected) {
        try {
          await syncAgreement(id);
        } catch (e) {}
        if (discoverAndSyncReviews) {
          try {
            await discoverAndSyncReviews();
          } catch (e) {}
        }
        if (discoverAndSyncNFTs) {
          try {
            await discoverAndSyncNFTs();
          } catch (e) {}
        }
      }
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
      const interval = setInterval(async () => {
        if (!isDemo && connected) {
          try {
            await syncAgreement(id);
          } catch (e) {}
          if (discoverAndSyncReviews) {
            try {
              await discoverAndSyncReviews();
            } catch (e) {}
          }
          if (discoverAndSyncNFTs) {
            try {
              await discoverAndSyncNFTs();
            } catch (e) {}
          }
        }
        const ag = mockDb.getAgreement(id);
        if (ag) {
          setAgreement(ag);
          setMilestones(mockDb.getAgreementMilestones(id));
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [id, connected]);

  useEffect(() => {
    if (agreement && address) {
      // Check existing review
      const rev = mockDb.getReviews().find(r => 
        String(r.agreement_id) === String(agreement.id) &&
        r.author_address?.toLowerCase() === address.toLowerCase()
      );
      setExistingReview(rev || null);

      // Check existing NFT
      const freelancerWallet = agreement.freelancer_address || address;
      const nftKey = `stellar_trust_nft_${freelancerWallet}`;
      const saved = localStorage.getItem(nftKey);
      if (saved) {
        try {
          const nfts = JSON.parse(saved);
          const foundNft = nfts.find((nft: any) => String(nft.agreement_id) === String(agreement.id));
          if (foundNft) {
            setNftMinted(true);
            setMintedNftId(foundNft.id);
          } else {
            setNftMinted(false);
            setMintedNftId(null);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setNftMinted(false);
        setMintedNftId(null);
      }
    }
  }, [agreement, address, reviewSubmitted, nftMinted]);

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
      await loadAgreementDetails();
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
      const minted = await mintNFT(agreement.id, agreement.freelancer_address, agreement.title);
      setNftMinted(true);
      if (minted && minted.id) {
        setMintedNftId(minted.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const isClient = agreement?.client_address?.toLowerCase() === address?.toLowerCase();
  const isFreelancer = agreement?.freelancer_address?.toLowerCase() === address?.toLowerCase();

  const currentMilestoneIndex = milestones.findIndex(m => m.status !== 'Released');

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
      
      {!id ? (
        <>
          {/* Create Escrow View */}
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

        {/* Agreements List Section */}
        {connected && (
          <div className="space-y-6 mt-12">
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-between">
              <span>Your Escrow Agreements</span>
              {!isDemo && discoverAndSyncAgreements && (
                <button
                  onClick={async () => {
                    if (address) {
                      setLoading(true);
                      try {
                        await discoverAndSyncAgreements(address);
                        setAllAgreements(mockDb.getAgreements());
                        alert("Synchronized with on-chain Soroban registry!");
                      } catch (err: any) {
                        alert("Failed to sync: " + (err.message || err));
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                  className="px-3 py-1 bg-purple-950/80 hover:bg-purple-900/40 border border-purple-800/30 text-purple-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Sync Ledger Agreements
                </button>
              )}
            </h2>
            
            {allAgreements.filter(ag => 
              ag.client_address?.toLowerCase() === address?.toLowerCase() ||
              ag.freelancer_address?.toLowerCase() === address?.toLowerCase()
            ).length === 0 ? (
              <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-500">No agreements found. Create one above to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allAgreements.filter(ag => 
                  ag.client_address?.toLowerCase() === address?.toLowerCase() ||
                  ag.freelancer_address?.toLowerCase() === address?.toLowerCase()
                ).map((ag: any) => {
                  const isUserClient = ag.client_address?.toLowerCase() === address?.toLowerCase();
                  const isUserFreelancer = ag.freelancer_address?.toLowerCase() === address?.toLowerCase();
                  
                  return (
                    <div 
                      key={ag.id} 
                      className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300 relative overflow-hidden"
                    >
                      {isUserFreelancer && ['Created', 'Funded'].includes(ag.status) && (
                        <div className="absolute top-0 right-0 bg-purple-950/80 border-b border-l border-purple-800/35 px-2.5 py-1 text-[10px] font-bold text-purple-400 uppercase tracking-widest rounded-bl-xl">
                          Pending Accept
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-base text-slate-100 line-clamp-1 pr-24">{ag.title}</h4>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            ag.status === 'Created' ? 'bg-yellow-950/45 text-yellow-400 border-yellow-800/40' :
                            ag.status === 'Funded' ? 'bg-blue-950/45 text-blue-400 border-blue-800/40' :
                            ag.status === 'Accepted' ? 'bg-indigo-950/45 text-indigo-400 border-indigo-800/40' :
                            ag.status === 'Submitted' ? 'bg-purple-950/45 text-purple-400 border-purple-800/40' :
                            ag.status === 'Approved' ? 'bg-pink-950/45 text-pink-400 border-pink-800/40' :
                            ag.status === 'Released' ? 'bg-emerald-950/45 text-emerald-400 border-emerald-800/40' :
                            ag.status === 'Disputed' ? 'bg-rose-950/45 text-rose-400 border-rose-800/40' :
                            'bg-slate-900/60 text-slate-400 border-slate-700/40'
                          }`}>
                            {ag.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {ag.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Amount</span>
                          <span className="font-extrabold text-slate-200">{ag.amount} XLM</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Role</span>
                          <span className="text-slate-300 font-semibold">{isUserClient ? 'Client' : 'Freelancer'}</span>
                        </div>
                        <Link
                          href={`/escrow?id=${ag.id}`}
                          className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </>
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
                  
                  {existingReview ? (
                    <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`text-sm ${
                                star <= existingReview.rating ? 'text-amber-400' : 'text-slate-600'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs font-bold text-slate-350 ml-1.5">
                            ({existingReview.rating} Stars Registered)
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/45 px-2.5 py-1 border border-emerald-800/40 rounded-full uppercase tracking-wider">
                          Feedback Registered
                        </span>
                      </div>
                      
                      {existingReview.comment && (
                        <p className="text-xs italic text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                          "{existingReview.comment}"
                        </p>
                      )}

                      {existingReview.tx_hash && (
                        <div className="flex justify-end pt-1">
                          <Link
                            href={`https://stellar.expert/explorer/testnet/tx/${existingReview.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                          >
                            <span>Verify Review on Stellar.Expert</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : reviewSubmitted ? (
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
                  {isClient && (
                    <div className="space-y-3">
                      {agreement.status === 'Created' && (
                        <>
                          <button
                            onClick={() => handleAction(() => fundEscrow(agreement.id))}
                            disabled={actionLoading}
                            className="w-full py-3 bg-cyan-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                          >
                            Fund Escrow Payouts
                          </button>
                          <button
                            onClick={() => handleAction(() => refundClient(agreement.id))}
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-slate-900 border border-slate-700 text-slate-350 hover:bg-slate-800/60 font-bold text-xs rounded-xl transition-all"
                          >
                            Cancel & Refund Escrow
                          </button>
                        </>
                      )}

                      {agreement.status === 'Funded' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-950/30 border border-blue-800/40 text-blue-400 text-xs rounded-xl text-center font-medium">
                            Waiting for Freelancer to accept project agreement...
                          </div>
                          <button
                            onClick={() => handleAction(() => refundClient(agreement.id))}
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-slate-900 border border-rose-800/30 text-rose-400 hover:bg-rose-950/20 font-bold text-xs rounded-xl transition-all"
                          >
                            Cancel & Refund Escrow
                          </button>
                        </div>
                      )}

                      {agreement.status === 'Accepted' && (
                        <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 text-indigo-400 text-xs rounded-xl text-center font-medium">
                          Freelancer is working on the project milestone...
                        </div>
                      )}

                      {agreement.status === 'Submitted' && (
                        <button
                          onClick={() => handleAction(() => approveWork(agreement.id))}
                          disabled={actionLoading}
                          className="w-full py-3 bg-emerald-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                        >
                          Approve Deliverables
                        </button>
                      )}

                      {agreement.status === 'Approved' && (
                        <button
                          onClick={() => handleAction(() => releasePayment(agreement.id))}
                          disabled={actionLoading}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                        >
                          Release Milestone Payment
                        </button>
                      )}

                      {agreement.status === 'Released' && (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl text-center font-bold">
                          ✓ All milestone payments released. Project completed!
                        </div>
                      )}

                      {agreement.status === 'Cancelled' && (
                        <div className="p-3 bg-slate-900/60 border border-white/5 text-slate-500 text-xs rounded-xl text-center">
                          Project cancelled. Escrow funds refunded.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Freelancer actions */}
                  {isFreelancer && (
                    <div className="space-y-3">
                      {agreement.status === 'Created' && (
                        <div className="p-3 bg-yellow-950/30 border border-yellow-800/40 text-yellow-500 text-xs rounded-xl text-center font-medium">
                          Waiting for Client to fund the escrow...
                        </div>
                      )}

                      {agreement.status === 'Funded' && (
                        <button
                          onClick={() => handleAction(() => acceptAgreement(agreement.id))}
                          disabled={actionLoading}
                          className="w-full py-3 bg-indigo-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                        >
                          Accept Project Agreement
                        </button>
                      )}

                      {['Accepted', 'Approved'].includes(agreement.status) && currentMilestoneIndex >= 0 && (
                        <button
                          onClick={() => handleAction(() => submitWork(agreement.id))}
                          disabled={actionLoading}
                          className="w-full py-3 bg-purple-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                        >
                          Submit Milestone Work
                        </button>
                      )}

                      {agreement.status === 'Submitted' && (
                        <div className="p-3 bg-purple-950/30 border border-purple-800/40 text-purple-400 text-xs rounded-xl text-center font-medium">
                          Work submitted. Waiting for Client approval...
                        </div>
                      )}

                      {agreement.status === 'Approved' && (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl text-center font-medium">
                          Work approved! Waiting for Client to release payment...
                        </div>
                      )}

                      {agreement.status === 'Released' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl text-center font-bold">
                            ✓ Project completed. All payments received!
                          </div>
                          {nftMinted ? (
                            <div className="p-3 bg-slate-900 border border-cyan-850/30 text-cyan-400 rounded-xl text-center text-xs font-bold flex flex-col items-center justify-center space-y-1.5">
                              <div className="flex items-center space-x-1.5">
                                <Award className="h-4.5 w-4.5 fill-cyan-400 text-cyan-400" />
                                <span>Certificate Claimed {mintedNftId ? `(Token #${mintedNftId})` : ''}</span>
                              </div>
                              <Link
                                href="/gallery"
                                className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-0.5 transition-colors"
                              >
                                <span>View in NFT Gallery</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
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
                          )}
                        </div>
                      )}

                      {agreement.status === 'Cancelled' && (
                        <div className="p-3 bg-slate-900/60 border border-white/5 text-slate-500 text-xs rounded-xl text-center">
                          Project cancelled. Escrow funds refunded.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Modify Agreement option for active projects */}
                  {['Created', 'Funded', 'Accepted', 'Submitted', 'Approved'].includes(agreement.status) && (isClient || isFreelancer) && (
                    <button
                      onClick={() => {
                        setModifyWarning(null);
                        setModifyDesc('');
                        setModifyDeadlineExtend(7);
                        setModifyModalOpen(true);
                      }}
                      className="w-full py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800/50 text-slate-300 font-bold text-xs rounded-xl transition-all"
                    >
                      Modify Agreement Terms
                    </button>
                  )}

                  {/* Dispute option for active projects */}
                  {['Accepted', 'Submitted', 'Approved'].includes(agreement.status) && (isClient || isFreelancer) && (
                    <button
                      onClick={() => handleAction(() => raiseDispute(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-slate-900 border border-rose-800/30 text-rose-400 hover:bg-rose-950/20 font-bold text-xs rounded-xl transition-all"
                    >
                      Raise Payout Dispute
                    </button>
                  )}

                  {agreement.status === 'Disputed' && (isClient || isFreelancer) && (
                    <button
                      onClick={() => handleAction(() => refundClient(agreement.id))}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800/50"
                    >
                      Authorize Refund (Resolve Dispute)
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
      {/* Modify Agreement Modal */}
      {modifyModalOpen && agreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>Modify Agreement Terms</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Propose adjustments to the project deadlines or details. Term updates will be saved immediately to the local cache.
            </p>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Extend Deadline</label>
                <select
                  value={modifyDeadlineExtend}
                  onChange={(e) => setModifyDeadlineExtend(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value={3}>Extend by 3 Days</option>
                  <option value={7}>Extend by 1 Week (7 Days)</option>
                  <option value={14}>Extend by 2 Weeks (14 Days)</option>
                  <option value={30}>Extend by 30 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Adjustment Reason / Notes</label>
                <textarea
                  rows={3}
                  value={modifyDesc}
                  onChange={(e) => setModifyDesc(e.target.value)}
                  placeholder="We agreed to extend the deadline to accommodate a change in the AMM pool specification."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {modifyWarning && (
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 text-amber-400 text-[11px] rounded-xl leading-relaxed">
                  <strong>⚠️ Term Negotiation Protocol:</strong> To maintain decentralized security, on-chain alterations require mutually signed consensus from both client and freelancer keys. The multi-signature term negotiation protocol is scheduled for the next mainnet upgrade.
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setModifyModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800/60 border border-white/5 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Check if it's a real contract in Live Mode
                  const isRealContract = !isDemo && !isNaN(parseInt(agreement.id));
                  if (isRealContract) {
                    setModifyWarning("show");
                  } else {
                    try {
                      setActionLoading(true);
                      await modifyAgreement(agreement.id, modifyDeadlineExtend, modifyDesc);
                      setModifyModalOpen(false);
                      await loadAgreementDetails();
                    } catch (err: any) {
                      alert(err.message || err);
                    } finally {
                      setActionLoading(false);
                    }
                  }
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
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
