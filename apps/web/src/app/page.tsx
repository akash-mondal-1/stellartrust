'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  Coins, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  Lock, 
  ChevronRight, 
  Star,
  Users,
  CheckCircle2,
  Wallet,
  Laptop,
  ExternalLink
} from 'lucide-react';
import { useStellar, WalletType } from '@/hooks/useStellar';

export default function LandingPage() {
  const { connected, connectWallet } = useStellar();
  const [activeTab, setActiveTab] = useState<'wallet' | 'faucet' | 'demo'>('wallet');

  const stats = [
    { label: 'Volume Secured', value: '450,210 XLM', change: '+14% this month' },
    { label: 'Active Escrows', value: '1,429', change: 'Zero disputes lost' },
    { label: 'Avg Trust Score', value: '94.2%', change: 'Freelancer avg score' },
    { label: 'NFT Certificates Issued', value: '892', change: 'Minted on-chain' },
  ];

  const features = [
    {
      icon: <Lock className="h-6 w-6 text-cyan-400" />,
      title: 'Soroban Escrow Machine',
      description: 'Funds are locked securely in Soroban smart contracts. Release is automated by milestone approval or managed mutual cancellation.'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      title: 'Decentralized Reputation',
      description: 'Reviews and projects feed an on-chain algorithm that updates your Trust Score. Build true creditability that you fully own.'
    },
    {
      icon: <Award className="h-6 w-6 text-blue-400" />,
      title: 'Proof-of-Completion NFTs',
      description: 'Every fully completed agreement automatically mints a unique NFT certificate containing project hash, date, and client signatures.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect Stellar Wallet',
      desc: 'Link Albedo, Freighter, or run in simulated Demo Mode for instant access.'
    },
    {
      number: '02',
      title: 'Create Work Agreement',
      desc: 'Client creates an agreement defining milestones, amount, and freelancer wallet.'
    },
    {
      number: '03',
      title: 'Lock Funds in Escrow',
      desc: 'Client locks XLM or token payment into the secure Soroban contract.'
    },
    {
      number: '04',
      title: 'Submit & Approve Milestones',
      desc: 'Freelancer submits work deliverables. Client reviews and releases funds on approval.'
    },
    {
      number: '05',
      title: 'Update Reputation & Mint NFT',
      desc: 'On payout, freelancer receives payment, rating updates, and an achievement NFT.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-cyan-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-400 animate-pulse-glow">
            <Star className="h-3.5 w-3.5 fill-cyan-400" />
            <span>Built for the Soroban Smart Contract Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-none">
            Decentralized Trust & Escrow for{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Global Freelancers
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Lock payments in secure smart contracts, track milestones transparently, build an unforgeable on-chain reputation score, and claim completed work NFT badges.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-950/30 flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 group"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            {!connected && (
              <button
                onClick={() => connectWallet(WalletType.FREIGHTER)}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="py-6 border-y border-white/5 bg-slate-950/40 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center lg:text-left space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stat.value}</p>
                <span className="text-[10px] font-medium text-cyan-400 flex items-center justify-center lg:justify-start space-x-1">
                  <span>{stat.change}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Engineered for Freelance Autonomy
          </h2>
          <p className="text-slate-400 font-medium">
            No middleman, no extortionate fees, and no chargeback fraud. Secure payment protocols governed entirely by immutable blockchain logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="glass-panel hover:glass-panel-glow border border-white/5 rounded-2xl p-8 space-y-4 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="p-3 bg-white/5 border border-white/10 w-fit rounded-xl">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Workflow Progress */}
      <section className="py-20 bg-slate-950/30 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              The Trust Cycle, Simplified
            </h2>
            <p className="text-slate-400 font-medium">
              Follow our onboarding-friendly loop from connection to NFT certificate issue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="space-y-4 text-center md:text-left relative z-10">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="text-3xl font-extrabold bg-gradient-to-tr from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                  <div className="h-px bg-white/10 flex-grow hidden md:block" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Wallet Setup & Faucet Onboarding Assistant */}
      <section className="py-20 max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">Interactive Onboarding Assistant</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Getting Started on Stellar Testnet
          </h2>
          <p className="text-slate-400 font-medium text-sm">
            Whether you are a Web3 developer or a first-time validator, setting up takes less than 2 minutes.
          </p>
        </div>

        <div className="glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          {/* Tab buttons switcher */}
          <div className="flex flex-wrap bg-slate-900/80 border border-white/5 p-1.5 rounded-2xl max-w-lg mx-auto">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-cyan-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>1. Setup Wallet</span>
            </button>
            <button
              onClick={() => setActiveTab('faucet')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faucet'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>2. Fund Faucet</span>
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'demo'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>3. Demo Simulator</span>
            </button>
          </div>

          {/* Tab content view */}
          <div className="pt-2">
            {activeTab === 'wallet' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-100">Step 1: Install Freighter or Albedo Extension</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Freighter is the official browser wallet extension designed by the Stellar Development Foundation. Albedo provides simple, cross-browser web keys.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="https://www.freighter.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-250 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Get Freighter Wallet</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href="https://albedo.link/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-250 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Get Albedo Wallet</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <div className="space-y-4 p-5 bg-slate-950/60 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed">
                  <h4 className="font-bold text-slate-250 uppercase tracking-wide">Configure Wallet to Testnet:</h4>
                  <ul className="list-decimal pl-4 space-y-2.5">
                    <li>Open your wallet extension settings (Freighter or Albedo).</li>
                    <li>Toggle network selection from <strong>Public</strong> to <strong>Testnet</strong>.</li>
                    <li>Click <strong>Connect Wallet</strong> in our navigation bar above.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'faucet' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-100">Step 2: Fund Wallet via Friendbot Faucet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Testnet XLM has no real-world value but is required to submit agreements and sign milestones on Stellar Testnet. Stellar provides a free bot called Friendbot to instantly grant 10,000 testnet XLM.
                  </p>
                </div>
                <div className="space-y-4 p-5 bg-slate-950/60 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed">
                  <h4 className="font-bold text-slate-250 uppercase tracking-wide">Acquiring Faucet Tokens:</h4>
                  <ul className="list-decimal pl-4 space-y-2.5">
                    <li>Copy your Stellar public address (starts with G...).</li>
                    <li>Visit our **Sandbox Testing Hub** faucet section or click **Manage Escrow** to call Friendbot.</li>
                    <li>Your account balance will update instantly on the dashboard once confirmed by the ledger.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'demo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-100">No Wallets Configured? Try Demo Simulator Mode</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To evaluate the application instantly without extensions or real blockchain calls, toggle **Demo Mode** in the header navigation bar.
                  </p>
                </div>
                <div className="space-y-4 p-5 bg-slate-950/60 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed">
                  <h4 className="font-bold text-slate-250 uppercase tracking-wide">Simulator Capabilities:</h4>
                  <ul className="list-decimal pl-4 space-y-2.5">
                    <li>Uses local storage mock consensus DB so state changes persist across reloads.</li>
                    <li>Simulates profile updates, escrow releases, rating changes, and NFT issues instantly.</li>
                    <li>Allows testing dual-sided client-freelancer flows simultaneously.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 max-w-4xl mx-auto px-4 text-center space-y-8">
        <div className="glass-panel border border-cyan-500/20 p-8 sm:p-12 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl -z-10" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            Ready to secure your next project?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-medium">
            Initiate a zero-trust payment agreement on Stellar Testnet and see smart contract automation in action.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Get Started Now</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center"
            >
              <span>Explore Sandbox Testing</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
