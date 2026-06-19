'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { NFT_CONTRACT } from '@/lib/stellar';
import { 
  Award, 
  FileCheck, 
  Calendar, 
  User, 
  Fingerprint, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileText
} from 'lucide-react';

export default function Gallery() {
  const { address, connected, mintNFT, discoverAndSyncNFTs } = useStellar();
  const [nfts, setNfts] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [claimingNftId, setClaimingNftId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNftsAndAgreements = () => {
    if (address) {
      const nftKey = `stellar_trust_nft_${address}`;
      const saved = localStorage.getItem(nftKey);
      if (saved) {
        setNfts(JSON.parse(saved));
      } else {
        setNfts([]);
      }
      // Load agreements where the user is the freelancer
      setAgreements(mockDb.getAgreements().filter(a => a.freelancer_address?.toLowerCase() === address.toLowerCase()));
    }
  };

  useEffect(() => {
    loadNftsAndAgreements();

    if (address && connected) {
      if (discoverAndSyncNFTs) {
        discoverAndSyncNFTs().then(() => {
          loadNftsAndAgreements();
        });
      }

      // Periodically polling to fetch newly minted NFTs
      const interval = setInterval(async () => {
        if (discoverAndSyncNFTs) {
          try {
            await discoverAndSyncNFTs();
          } catch (e) {}
        }
        loadNftsAndAgreements();
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [address, connected]);

  // Filter completed freelance agreements that do not have a minted NFT yet
  const eligibleProjects = agreements.filter(a => 
    a.status === 'Released' && !nfts.some(nft => nft.agreement_id === a.id)
  );

  // In-progress freelance agreements that aren't yet released
  const inProgressProjects = agreements.filter(a => 
    a.status !== 'Released' && a.status !== 'Cancelled'
  );

  const handleClaimNFT = async (agreementId: string, projectName: string) => {
    if (!address) return;
    setClaimingNftId(agreementId);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await mintNFT(agreementId, address, projectName);
      setSuccessMessage(`Achievement NFT for "${projectName}" minted successfully! It is now securely registered to your wallet on-chain.`);
      loadNftsAndAgreements();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to mint achievement NFT.');
    } finally {
      setClaimingNftId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Achievement NFT Gallery</h1>
          <p className="text-slate-400 text-sm">On-chain certified proof-of-work completion badges issued to your wallet address.</p>
        </div>

        {!connected ? (
          <div className="text-center py-20 glass-panel border border-white/5 rounded-2xl space-y-3">
            <Award className="h-12 w-12 text-cyan-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Connect Wallet to view NFT collection</h2>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              Badges are synced dynamically with the Achievement NFT contract on Stellar Testnet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Status alerts */}
            {(successMessage || errorMessage) && (
              <div className="max-w-3xl mx-auto space-y-3">
                {successMessage && (
                  <div className="p-4 bg-emerald-950/45 border border-emerald-800/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{successMessage}</span>
                  </div>
                )}
                {errorMessage && (
                  <div className="p-4 bg-rose-950/45 border border-rose-800/40 text-rose-400 rounded-xl text-xs font-bold">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* Claims & Pending Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Claims Section */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Eligible to Mint */}
                <div className="glass-panel border border-cyan-500/20 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                    <Award className="h-4.5 w-4.5 text-cyan-400" />
                    <span>Eligible Certificates to Claim</span>
                  </h3>
                  
                  {eligibleProjects.length === 0 ? (
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                      <p>No new completed projects are currently eligible for certificate minting.</p>
                      <p className="text-slate-500">
                        Certificates can only be claimed for projects where you are the freelancer and the client has fully released the escrow payments.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eligibleProjects.map(a => (
                        <div 
                          key={a.id} 
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/50 border border-cyan-500/20 p-4 rounded-xl gap-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-slate-100">{a.title}</h4>
                            <div className="text-slate-400 text-xs flex items-center space-x-3">
                              <span>Amount: <strong className="text-slate-200">{a.amount} XLM</strong></span>
                              <span>•</span>
                              <span>Completed: <strong>{new Date(a.updated_at).toLocaleDateString()}</strong></span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleClaimNFT(a.id, a.title)}
                            disabled={claimingNftId !== null}
                            className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center space-x-1.5 shadow"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{claimingNftId === a.id ? 'Minting...' : 'Claim & Mint Certificate'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* In Progress helper */}
                {inProgressProjects.length > 0 && (
                  <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                      <FileText className="h-4.5 w-4.5 text-yellow-500" />
                      <span>Pending Freelance Projects</span>
                    </h3>
                    <div className="space-y-3">
                      {inProgressProjects.map(a => (
                        <div key={a.id} className="flex justify-between items-center bg-slate-900/30 border border-white/5 p-3.5 rounded-xl text-xs">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-200">{a.title}</h4>
                            <span className="text-slate-500 block">
                              Status: <strong className="text-yellow-500/80">{a.status}</strong> (Requires 'Released' status to unlock NFT certificate)
                            </span>
                          </div>
                          <Link 
                            href={`/escrow?id=${a.id}`}
                            className="px-3 py-1.5 bg-slate-800 border border-white/10 text-cyan-400 hover:text-cyan-300 font-bold rounded-lg transition-colors"
                          >
                            Go to Escrow
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Guide card */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4 h-fit">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                  <span>On-Chain Trust Badges</span>
                </h3>
                <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
                  <p>
                    StellarTrust completion badges are secure, non-transferable achievement tokens minted using Soroban smart contracts.
                  </p>
                  <p className="border-t border-white/5 pt-3 font-semibold text-slate-350">
                    How it works:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-500">
                    <li>Deliverables are submitted and verified on-chain.</li>
                    <li>Client authorizes release of locked funds.</li>
                    <li>Freelancer gains access to one-click certificate minting.</li>
                    <li>Permanent cryptographic hash of the deliverables is tied to your wallet address.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Gallery Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Your Minted Certificates ({nfts.length})</h3>
              
              {nfts.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl space-y-3">
                  <Award className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">No achievement certificates minted yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {nfts.map((nft) => (
                    <div 
                      key={nft.id} 
                      className="glass-panel hover:glass-panel-glow border border-white/10 rounded-2xl overflow-hidden p-6 space-y-5 transition-all duration-300 hover:-translate-y-1 relative group"
                    >
                      {/* Glowing Overlay Background */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                      {/* Badge Visual Design */}
                      <div className="bg-gradient-to-tr from-slate-900 to-slate-950 border border-white/10 rounded-xl p-6 text-center space-y-3 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full filter blur-2xl" />
                        <Award className="h-12 w-12 text-cyan-400 mx-auto animate-pulse-glow" />
                        <div>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Soroban Certificate</span>
                          <h4 className="font-extrabold text-sm text-slate-100 line-clamp-1 mt-1">{nft.project_name}</h4>
                        </div>
                      </div>

                      {/* Details list */}
                      <div className="space-y-2.5 text-[11px] text-slate-400">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="font-semibold text-slate-500 uppercase flex items-center space-x-1">
                            <Fingerprint className="h-3.5 w-3.5 text-cyan-500" />
                            <span>Token ID</span>
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">#{nft.id}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="font-semibold text-slate-500 uppercase flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Completed</span>
                          </span>
                          <span className="text-slate-350">{new Date(nft.completion_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="font-semibold text-slate-500 uppercase flex items-center space-x-1">
                            <User className="h-3.5 w-3.5" />
                            <span>Freelancer</span>
                          </span>
                          <span className="font-mono text-slate-350">
                            {nft.freelancer.substring(0, 5)}...{nft.freelancer.substring(nft.freelancer.length - 5)}
                          </span>
                        </div>

                        <div className="flex flex-col space-y-1 pt-1">
                          <span className="font-semibold text-slate-500 uppercase flex items-center space-x-1">
                            <FileCheck className="h-3.5 w-3.5 text-purple-400" />
                            <span>Deliverable Hash</span>
                          </span>
                          <span className="font-mono text-slate-400 text-[10px] bg-slate-900/60 p-1.5 rounded border border-white/5 break-all">
                            {nft.project_hash}
                          </span>
                        </div>
                      </div>

                      {/* Action button */}
                      <a 
                        href={nft.tx_hash ? `https://stellar.expert/explorer/testnet/tx/${nft.tx_hash}` : `https://stellar.expert/explorer/testnet/contract/${NFT_CONTRACT}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-slate-900 border border-white/10 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 hover:bg-slate-800/80 transition-colors"
                      >
                        <span>Verify on Stellar.Expert</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
