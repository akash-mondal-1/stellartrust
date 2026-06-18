'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Cpu, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  Coins, 
  TrendingUp, 
  Zap, 
  Maximize2, 
  Minimize2,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Compass
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides: Slide[] = [
    {
      title: "StellarTrust",
      subtitle: "Decentralized trust protocol layer for global freelancers",
      icon: <Compass className="h-10 w-10 text-cyan-400" />,
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-cyan-500/20 px-4 py-2 rounded-full text-xs font-semibold text-cyan-400">
            <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Built on Stellar & Soroban Ecosystem</span>
          </div>
          <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Securing Global Freelance Payouts & Reputation
          </h3>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Eliminating intermediate fees, review manipulations, and payment security issues with smart-contract escrow locks and immutable on-chain trust indexes.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Go to Sandbox Dashboard
            </Link>
          </div>
        </div>
      )
    },
    {
      title: "The Problem",
      subtitle: "Centralized platforms have high fees & low trust",
      icon: <AlertTriangle className="h-10 w-10 text-rose-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="glass-panel border border-rose-500/10 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-rose-950/45 border border-rose-800/30 text-rose-400 w-fit rounded-xl font-bold text-xs">20% Fees</div>
            <h4 className="font-bold text-base text-slate-100">Exorbitant Take Rates</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional marketplaces like Upwork and Fiverr extract up to 20% of freelancer earnings, hurting independent workers.
            </p>
          </div>
          <div className="glass-panel border border-rose-500/10 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-rose-950/45 border border-rose-800/30 text-rose-400 w-fit rounded-xl font-bold text-xs">Fake Reviews</div>
            <h4 className="font-bold text-base text-slate-100">Forged Reputation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized reviews can easily be bought, deleted by platforms, or manipulated, leaving clients vulnerable to low-quality work.
            </p>
          </div>
          <div className="glass-panel border border-rose-500/10 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-rose-950/45 border border-rose-800/30 text-rose-400 w-fit rounded-xl font-bold text-xs">Holdouts</div>
            <h4 className="font-bold text-base text-slate-100">Payment Insecurity</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Freelancers face chargeback fraud, arbitrary account suspension, and client payment delays, risking their livelihoods.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Solution",
      subtitle: "Smart Contract Escrows, On-Chain Trust & Completion NFTs",
      icon: <ShieldCheck className="h-10 w-10 text-cyan-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="glass-panel border border-cyan-500/10 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 w-fit rounded-xl">
              <Coins className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-base text-slate-100">Soroban Escrow Machine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Client funds are locked securely in immutable smart contracts. Released in phases by milestones. Zero intermediary fees.
            </p>
          </div>
          <div className="glass-panel border border-cyan-500/10 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 w-fit rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-base text-slate-100">On-Chain Trust Score</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A public, self-sovereign rating algorithm calculated directly from verified contract completions and peer reviews.
            </p>
          </div>
          <div className="glass-panel border border-cyan-500/10 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 w-fit rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-base text-slate-100">Achievement Certificates</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every successfully completed project triggers the minting of a unique completion NFT with project hash signatures.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Core Architecture",
      subtitle: "Modular Rust smart contracts executing on Soroban WASM",
      icon: <Cpu className="h-10 w-10 text-purple-400" />,
      content: (
        <div className="space-y-6 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">1. Identity</span>
              <h5 className="font-bold text-sm text-slate-200">Identity Registry</h5>
              <p className="text-[10px] text-slate-400">Stores public profiles, usernames, skills tags, and oracle checkmarks.</p>
            </div>
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">2. Escrow</span>
              <h5 className="font-bold text-sm text-slate-200">Escrow Contract</h5>
              <p className="text-[10px] text-slate-400">Manages XLM deposits, milestone checks, mutual release, and disputes.</p>
            </div>
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">3. Reputation</span>
              <h5 className="font-bold text-sm text-slate-200">Reputation Contract</h5>
              <p className="text-[10px] text-slate-400">Calculates ratings dynamically, incrementing Trust Scores on-chain.</p>
            </div>
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">4. NFT Badge</span>
              <h5 className="font-bold text-sm text-slate-200">Certificates NFT</h5>
              <p className="text-[10px] text-slate-400">Mints verifiable proof-of-work badges to freelancer wallets.</p>
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Immutable Blockchain Operations</h4>
            <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">create_agreement()</span>
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">fund_agreement()</span>
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">accept_agreement()</span>
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">submit_work()</span>
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">release_payment()</span>
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">submit_review()</span>
              <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-white/5 rounded">mint_project_certificate()</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Stellar Integration",
      subtitle: "Leveraging key ecosystem primitives on Stellar Testnet",
      icon: <Zap className="h-10 w-10 text-cyan-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2 text-left max-w-4xl mx-auto">
          <div className="space-y-4">
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400" />
              <span>Multi-Wallet Kit Integration</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses `@creit.tech/stellar-wallets-kit` to connect to **Freighter, Albedo, and xBull** wallets. Signs transaction envelopes securely client-side.
            </p>
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400" />
              <span>Soroban RPC simulation</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escrow creations, funding, and approvals simulate footprint resource fees to auto-configure transaction execution gas on Stellar Testnet.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400" />
              <span>Dynamic Horizon Events Logging</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Polls Horizon APIs and Soroban RPC `getEvents` to track profiles update hashes and verify identity audit checkmarks dynamically.
            </p>
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400" />
              <span>Native XLM Stroop Conversions</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interfaces directly with native XLM token contracts (`CDLZFC3...`), converting stroop decimal balances on-chain.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Traction & Verification",
      subtitle: "Quantifying validation benchmarks and user activity",
      icon: <TrendingUp className="h-10 w-10 text-cyan-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4 max-w-4xl mx-auto">
          <div className="glass-panel border border-white/5 rounded-2xl p-5 text-center space-y-1">
            <span className="text-3xl font-black text-white">50+</span>
            <h4 className="font-bold text-xs text-slate-350">Onboarded Wallets</h4>
            <p className="text-[10px] text-slate-400">Tested and synced profiles on Stellar testnet.</p>
          </div>
          <div className="glass-panel border border-white/5 rounded-2xl p-5 text-center space-y-1">
            <span className="text-3xl font-black text-white">100%</span>
            <h4 className="font-bold text-xs text-slate-350">Agreement Success</h4>
            <p className="text-[10px] text-slate-400">Zero locked escrow funds lost to disputes.</p>
          </div>
          <div className="glass-panel border border-white/5 rounded-2xl p-5 text-center space-y-1">
            <span className="text-3xl font-black text-white">20+</span>
            <h4 className="font-bold text-xs text-slate-350">Github Commits</h4>
            <p className="text-[10px] text-slate-400">Clean development history logs.</p>
          </div>
          <div className="glass-panel border border-white/5 rounded-2xl p-5 text-center space-y-1">
            <span className="text-3xl font-black text-white">11+</span>
            <h4 className="font-bold text-xs text-slate-350">Validator Reports</h4>
            <p className="text-[10px] text-slate-400">Feedback summaries captured on-disk.</p>
          </div>
        </div>
      )
    },
    {
      title: "Growth Strategy",
      subtitle: "Growing the network from 18 to 50+ testnet users",
      icon: <Briefcase className="h-10 w-10 text-purple-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-w-4xl mx-auto">
          <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-3">
            <div className="bg-slate-900 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-cyan-400 rounded w-fit">Guided Walkthroughs</div>
            <h4 className="font-bold text-base text-slate-100">Simplified Ingress</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step-by-step assistant guiding users from Freighter setup, to friendbot funding, and profile creation.
            </p>
          </div>
          <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-3">
            <div className="bg-slate-900 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-purple-400 rounded w-fit">Referral Invites</div>
            <h4 className="font-bold text-base text-slate-100">Multiplayer Loop</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clients can draft contracts and invite freelancers via pre-formatted URL parameters, triggering auto-fill settings.
            </p>
          </div>
          <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-3">
            <div className="bg-slate-900 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-blue-400 rounded w-fit">Social Shares</div>
            <h4 className="font-bold text-base text-slate-100">Reputation Flex</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Viral buttons enabling freelancers to tweet completed projects or show off their Trust Score certificates.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Roadmap",
      subtitle: "Post-hackathon development and scaling plan",
      icon: <Presentation className="h-10 w-10 text-cyan-400" />,
      content: (
        <div className="space-y-6 max-w-3xl mx-auto py-2 text-left">
          <div className="relative border-l-2 border-cyan-500/25 pl-6 ml-4 space-y-6">
            <div className="relative">
              <div className="absolute -left-[31px] top-1 bg-cyan-500 h-4 w-4 rounded-full border-2 border-slate-950" />
              <h4 className="font-bold text-sm text-slate-100">Phase 1: Multi-Token & USDC support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock payments in Stellar-anchored USDC and other custom asset anchors, adding price-stability.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1 bg-purple-500 h-4 w-4 rounded-full border-2 border-slate-950" />
              <h4 className="font-bold text-sm text-slate-100">Phase 2: Job Board API SDK</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Distribute an open API allowing platforms like Gitcoin or Upwork to call StellarTrust escrows programmatically.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1 bg-blue-500 h-4 w-4 rounded-full border-2 border-slate-950" />
              <h4 className="font-bold text-sm text-slate-100">Phase 3: Dispute Resolution DAO</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Establish a decentralized staking tribunal to resolve complex contract disputes fairly on-chain.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col justify-center">
        
        {/* Pitch Controls and Title */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <Presentation className="h-5 w-5 text-cyan-400" />
              <span>Interactive Pitch Deck</span>
            </h1>
            <p className="text-xs text-slate-400">Discover the StellarTrust product vision, ecosystem architecture, and market strategy.</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-350 hover:text-cyan-400 rounded-xl transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Slide Frame container */}
        <div className={`relative w-full rounded-3xl overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-8 sm:p-12' 
            : 'glass-panel border border-white/10 min-h-[460px] flex flex-col justify-between p-8 sm:p-12'
        }`}>
          
          {/* Header section of slides */}
          <div className="flex justify-between items-start border-b border-white/5 pb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                {slides[currentSlide].icon}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Slide {currentSlide + 1} of {slides.length}</span>
                <h2 className="text-lg sm:text-2xl font-black text-slate-100">{slides[currentSlide].title}</h2>
                <p className="text-xs text-slate-450">{slides[currentSlide].subtitle}</p>
              </div>
            </div>
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-slate-200 text-xs font-bold border border-white/10 rounded-xl transition-all"
              >
                Exit View
              </button>
            )}
          </div>

          {/* Slide Content */}
          <div className="py-8 flex-grow flex items-center justify-center">
            {slides[currentSlide].content}
          </div>

          {/* Controls Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6">
            
            {/* Slide Indicators dot bar */}
            <div className="flex space-x-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide 
                      ? 'w-6 bg-gradient-to-r from-cyan-400 to-purple-500' 
                      : 'w-1.5 bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-cyan-400 rounded-xl transition-all active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-slate-500 font-bold font-mono">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={handleNext}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-cyan-400 rounded-xl transition-all active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Tip indicator */}
        <p className="text-center text-[10px] text-slate-500 font-medium mt-4">
          💡 Tip: You can also navigate using the <strong>Left</strong> and <strong>Right</strong> arrow keys on your keyboard.
        </p>

      </main>

      <Footer />
    </div>
  );
}
