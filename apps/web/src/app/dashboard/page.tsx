'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  Plus, 
  ArrowUpRight, 
  Coins, 
  Award, 
  FileText, 
  UserCheck, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle,
  Briefcase,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { address, connected, userProfile, isDemo } = useStellar();
  
  const [activeRole, setActiveRole] = useState<'client' | 'freelancer'>('client');
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats calculation
  const clientAgreements = agreements.filter(a => a.client_address === address);
  const freelancerAgreements = agreements.filter(a => a.freelancer_address === address);

  const activeClientAgreements = clientAgreements.filter(a => !['Released', 'Cancelled'].includes(a.status));
  const activeFreelancerAgreements = freelancerAgreements.filter(a => !['Released', 'Cancelled'].includes(a.status));

  const totalSpent = clientAgreements
    .filter(a => a.status === 'Released')
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  const totalEarned = freelancerAgreements
    .filter(a => a.status === 'Released')
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  const pendingClientPayouts = clientAgreements
    .filter(a => ['Funded', 'Accepted', 'Submitted', 'Approved'].includes(a.status))
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  const pendingFreelancerPayouts = freelancerAgreements
    .filter(a => ['Funded', 'Accepted', 'Submitted', 'Approved'].includes(a.status))
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  useEffect(() => {
    if (address) {
      setLoading(true);
      // Fetch agreements from mockDb
      const all = mockDb.getAgreements();
      setAgreements(all);
      setLoading(false);

      // Poll database for updates every 4 seconds
      const interval = setInterval(() => {
        setAgreements(mockDb.getAgreements());
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setAgreements([]);
      setLoading(false);
    }
  }, [address]);

  // Onboarding Wizard progress
  const hasProfile = !!userProfile?.username;
  const hasAgreements = activeRole === 'client' ? clientAgreements.length > 0 : freelancerAgreements.length > 0;
  const hasCompleted = activeRole === 'client' 
    ? clientAgreements.some(a => a.status === 'Released') 
    : freelancerAgreements.some(a => a.status === 'Released');

  const nftKey = address ? `stellar_trust_nft_${address}` : '';
  const hasNFT = address && typeof window !== 'undefined' 
    ? (JSON.parse(localStorage.getItem(nftKey) || '[]').length > 0)
    : false;

  const onboardingSteps = [
    { label: 'Connect Wallet', done: connected, link: '/' },
    { label: 'Create Profile', done: hasProfile, link: '/settings' },
    { label: 'Create/Accept Agreement', done: hasAgreements, link: '/escrow' },
    { label: 'Complete First Project', done: hasCompleted, link: '/escrow' },
    { label: 'Mint Achievement NFT', done: hasNFT, link: '/gallery' },
  ];

  const completedStepsCount = onboardingSteps.filter(s => s.done).length;
  const onboardingProgress = Math.round((completedStepsCount / onboardingSteps.length) * 100);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Created: 'bg-yellow-950/45 text-yellow-400 border-yellow-800/40',
      Funded: 'bg-blue-950/45 text-blue-400 border-blue-800/40',
      Accepted: 'bg-indigo-950/45 text-indigo-400 border-indigo-800/40',
      Submitted: 'bg-purple-950/45 text-purple-400 border-purple-800/40',
      Approved: 'bg-pink-950/45 text-pink-400 border-pink-800/40',
      Released: 'bg-emerald-950/45 text-emerald-400 border-emerald-800/40',
      Disputed: 'bg-rose-950/45 text-rose-400 border-rose-800/40',
      Cancelled: 'bg-slate-900/60 text-slate-400 border-slate-700/40',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.Created}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Onboarding Wizard Checklist */}
        {connected && onboardingProgress < 100 && (
          <div className="glass-panel border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1">
                  <span>Getting Started Walkthrough</span>
                </span>
                <h2 className="text-lg font-bold text-slate-100">Complete these steps to unlock full trust status</h2>
                <div className="w-64 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5 mt-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300" style={{ width: `${onboardingProgress}%` }} />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-slate-200">{onboardingProgress}% Complete</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
              {onboardingSteps.map((step, idx) => (
                <Link 
                  href={step.link} 
                  key={idx}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    step.done 
                      ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400' 
                      : 'bg-white/5 border-white/5 hover:border-cyan-500/20 text-slate-400'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <CheckCircle className={`h-4.5 w-4.5 ${step.done ? 'fill-emerald-400 text-slate-950' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-xs font-bold block">{step.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Not Connected Block */}
        {!connected && (
          <div className="text-center py-20 glass-panel border border-white/5 rounded-2xl space-y-4">
            <ShieldAlert className="h-12 w-12 text-cyan-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-extrabold text-slate-100">Wallet not connected</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              Please connect your Stellar Wallet or toggle "Demo Mode" in the navigation bar to proceed.
            </p>
          </div>
        )}

        {connected && (
          <>
            {/* Role Switcher & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Welcome, {userProfile?.username ? `@${userProfile.username}` : 'Freelancer'}</h1>
                <p className="text-slate-400 text-sm">Review payments, metrics, and contracts sync status.</p>
              </div>

              {/* Client/Freelancer Tab Toggle */}
              <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl">
                <button
                  onClick={() => setActiveRole('client')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeRole === 'client' 
                      ? 'bg-cyan-500 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Client Board</span>
                </button>
                <button
                  onClick={() => setActiveRole('freelancer')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeRole === 'freelancer' 
                      ? 'bg-purple-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Freelancer Board</span>
                </button>
              </div>
            </div>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
                <div className="p-3 bg-cyan-950/40 text-cyan-400 border border-cyan-800/30 rounded-xl">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">
                    {activeRole === 'client' ? 'Total Spent Payouts' : 'Total Earned Payouts'}
                  </span>
                  <span className="text-2xl font-extrabold text-slate-100">
                    {activeRole === 'client' ? totalSpent : totalEarned} XLM
                  </span>
                </div>
              </div>

              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
                <div className="p-3 bg-purple-950/40 text-purple-400 border border-purple-800/30 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Active Agreements</span>
                  <span className="text-2xl font-extrabold text-slate-100">
                    {activeRole === 'client' ? activeClientAgreements.length : activeFreelancerAgreements.length}
                  </span>
                </div>
              </div>

              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
                <div className="p-3 bg-blue-950/40 text-blue-400 border border-blue-800/30 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">
                    {activeRole === 'client' ? 'Pending locked Escrow' : 'Expected incoming payments'}
                  </span>
                  <span className="text-2xl font-extrabold text-slate-100">
                    {activeRole === 'client' ? pendingClientPayouts : pendingFreelancerPayouts} XLM
                  </span>
                </div>
              </div>
            </div>

            {/* Agreements Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">
                  {activeRole === 'client' ? 'Agreements Created by You' : 'Agreements Assigned to You'}
                </h3>
                {activeRole === 'client' && (
                  <Link
                    href="/escrow"
                    className="flex items-center space-x-1 bg-cyan-500 hover:opacity-90 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-950/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Agreement</span>
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-slate-900/40 rounded-2xl border border-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (activeRole === 'client' ? clientAgreements : freelancerAgreements).length === 0 ? (
                <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl space-y-2">
                  <p className="text-sm text-slate-500">No agreements found in this view</p>
                  {activeRole === 'client' && (
                    <p className="text-xs text-slate-600">Click "Create Agreement" to initiate a payment escrow.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(activeRole === 'client' ? clientAgreements : freelancerAgreements).map((ag: any) => (
                    <div 
                      key={ag.id} 
                      className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-base text-slate-100 line-clamp-1">{ag.title}</h4>
                          {getStatusBadge(ag.status)}
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
                          <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">
                            {activeRole === 'client' ? 'Freelancer' : 'Client'}
                          </span>
                          <span className="font-mono text-slate-300">
                            {activeRole === 'client' 
                              ? `${ag.freelancer_address?.substring(0, 5)}...${ag.freelancer_address?.substring(ag.freelancer_address.length - 5)}`
                              : `${ag.client_address?.substring(0, 5)}...${ag.client_address?.substring(ag.client_address.length - 5)}`
                            }
                          </span>
                        </div>
                        <Link
                          href={`/escrow?id=${ag.id}`}
                          className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
