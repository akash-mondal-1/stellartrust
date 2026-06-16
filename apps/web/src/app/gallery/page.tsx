'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { 
  Award, 
  FileCheck, 
  Calendar, 
  User, 
  Fingerprint, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Gallery() {
  const { address, connected } = useStellar();
  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {
    if (address) {
      const nftKey = `stellar_trust_nft_${address}`;
      const saved = localStorage.getItem(nftKey);
      if (saved) {
        setNfts(JSON.parse(saved));
      }
    }
  }, [address]);

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
        ) : nfts.length === 0 ? (
          <div className="text-center py-24 glass-panel border border-white/5 rounded-2xl space-y-4 max-w-2xl mx-auto">
            <div className="p-4 bg-slate-900 border border-slate-800 w-fit rounded-full mx-auto">
              <Award className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-200">No Certificates Minted</h2>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Once you complete an escrow agreement and receive payment, you will be prompted to claim your non-transferable completion certificate NFT on-chain.
            </p>
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
                  href={`https://stellar.expert/explorer/testnet/tx/${nft.project_hash}`}
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
      </main>

      <Footer />
    </div>
  );
}
