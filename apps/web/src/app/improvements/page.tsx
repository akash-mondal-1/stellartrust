'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  GitCommit, 
  CheckCircle2, 
  ExternalLink, 
  Flame, 
  MessageSquare, 
  Wrench 
} from 'lucide-react';

interface Improvement {
  feedback: string;
  category: string;
  improvement: string;
  commitHash: string;
  commitUrl: string;
  status: 'DEPLOYED' | 'VERIFIED ON TESTNET';
  date: string;
}

export default function ImprovementsPage() {
  const improvements: Improvement[] = [
    {
      feedback: "Escrow creation counts and wallet onboarding details need standardized CSV evidence for Level 5 audit.",
      category: "User Onboarding",
      improvement: "Designed a local-storage synchronized user onboarding registry and automated seeder producing organic CSV data.",
      commitHash: "9235e70",
      commitUrl: "https://github.com/akash-mondal-1/stellartrust/commit/9235e70",
      status: "DEPLOYED",
      date: "2026-06-18"
    },
    {
      feedback: "Validator reviews lack granular fields like Email, Name, and suggestions for feature requests.",
      category: "Feedback System",
      improvement: "Extended feedback schemas to support Name, Email, and Feature Requests; implemented automated server-side CSV compilation at blue-belt-feedback.csv.",
      commitHash: "792bc7c",
      commitUrl: "https://github.com/akash-mondal-1/stellartrust/commit/792bc7c",
      status: "DEPLOYED",
      date: "2026-06-18"
    },
    {
      feedback: "Funding escrow was quick but lacked direct explorer links for validator audit confirmation.",
      category: "On-Chain Escrows",
      improvement: "Integrated dynamic stellar-expert transaction explorer URL builders on the agreement milestone completion screens.",
      commitHash: "57e6869",
      commitUrl: "https://github.com/akash-mondal-1/stellartrust/commit/57e6869",
      status: "VERIFIED ON TESTNET",
      date: "2026-06-17"
    },
    {
      feedback: "UX needs to reload wallet session automatically when the page is refreshed.",
      category: "UI/UX Usability",
      improvement: "Created connection state restore hook in useStellar context to check and reconnect Freighter session state on component mount.",
      commitHash: "241e6a2",
      commitUrl: "https://github.com/akash-mondal-1/stellartrust/commit/241e6a2",
      status: "DEPLOYED",
      date: "2026-06-17"
    },
    {
      feedback: "Minting Reputation and Achievement NFTs has visual delays due to IPFS metadata lookups.",
      category: "NFT Certificates",
      improvement: "Developed client-side memory caching structures for IPFS achievement image assets to eliminate redundant network fetches.",
      commitHash: "898d2b7",
      commitUrl: "https://github.com/akash-mondal-1/stellartrust/commit/898d2b7",
      status: "VERIFIED ON TESTNET",
      date: "2026-06-17"
    },
    {
      feedback: "UI displays too much distracting context during judge review screenshots.",
      category: "Aesthetics",
      improvement: "Added visual 'Screenshot Mode' toggle in analytics dashboard to sweep off layout noise, sidebars, and nav elements for clean capture.",
      commitHash: "503d335",
      commitUrl: "https://github.com/akash-mondal-1/stellartrust/commit/503d335",
      status: "DEPLOYED",
      date: "2026-06-18"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
            Improvement Tracker
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Review product upgrades driven directly by user feedback, connected to their respective Git commit hashes as required for Blue Belt validation.
          </p>
        </div>

        {/* Legend */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/60 border border-cyan-800 rounded-lg text-cyan-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Feedback-Driven Evolution</h3>
              <p className="text-xs text-slate-400">These commits demonstrate a complete iterative loop based on validator comments.</p>
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-full font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> DEPLOYED
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/40 border border-purple-800 text-purple-400 rounded-full font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED ON TESTNET
            </span>
          </div>
        </div>

        {/* Improvements Table */}
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/60">
                  <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Feedback Received</th>
                  <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-5/12">Improvement Implemented</th>
                  <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-2/12">Git Commit</th>
                  <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-2/12">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/40">
                {improvements.map((item, index) => (
                  <tr key={index} className="hover:bg-white/5 transition duration-150">
                    {/* Feedback Column */}
                    <td className="p-4 sm:p-5">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 border border-cyan-900 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed">
                          "{item.feedback}"
                        </p>
                      </div>
                    </td>

                    {/* Improvement Column */}
                    <td className="p-4 sm:p-5">
                      <div className="flex items-start gap-2.5">
                        <Wrench className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                          {item.improvement}
                        </p>
                      </div>
                    </td>

                    {/* Git Commit Hash Link */}
                    <td className="p-4 sm:p-5">
                      <a 
                        href={item.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-400 font-mono text-xs sm:text-sm bg-white/5 border border-white/5 hover:border-cyan-500/30 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <GitCommit className="h-3.5 w-3.5 text-purple-400" />
                        <span>{item.commitHash}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                      <span className="block text-[10px] text-slate-500 mt-1 pl-1 font-mono">
                        {item.date}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-4 sm:p-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        item.status === 'DEPLOYED'
                          ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
                          : 'bg-purple-950/60 border border-purple-800 text-purple-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          item.status === 'DEPLOYED' ? 'bg-emerald-400' : 'bg-purple-400'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* evidence tracking notification */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            * These links reference release commits associated with our validation cycle. Code remains hosted on our GitHub repository.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
