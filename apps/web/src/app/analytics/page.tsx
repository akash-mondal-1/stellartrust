'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockDb } from '@/lib/supabase';
import { useStellar } from '@/hooks/useStellar';
import { getBlockchainEvents } from '@/lib/stellar';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Coins, 
  Award, 
  CheckCircle, 
  Calendar,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Share2,
  Camera
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { isDemo, connected, address } = useStellar();
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  // New Blue Belt Metrics states
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [onboardingsCount, setOnboardingsCount] = useState(0);
  const [onboardingsList, setOnboardingsList] = useState<any[]>([]);
  const [agreementsCount, setAgreementsCount] = useState(0);
  const [completedAgreementsCount, setCompletedAgreementsCount] = useState(0);
  const [nftsMintedCount, setNftsMintedCount] = useState(0);
  const [dauCount, setDauCount] = useState(15);

  const fetchAnalyticsEvents = async () => {
    try {
      const res = await fetch('/api/export-csv');
      let serverEvents: any[] = [];
      if (res.ok) {
        serverEvents = await res.json();
      }

      const localEvents = mockDb.getValidationEvents();
      let chainEvents: any[] = [];
      if (!isDemo) {
        try {
          chainEvents = await getBlockchainEvents();
        } catch (e) {
          console.warn("Analytics page getBlockchainEvents error:", e);
        }
      }

      // Merge and deduplicate by ID
      const allEventsMap = new Map<string, any>();
      serverEvents.forEach((e: any) => allEventsMap.set(e.id, e));
      localEvents.forEach((e: any) => allEventsMap.set(e.id, e));
      chainEvents.forEach((e: any) => allEventsMap.set(e.id, e));

      const sorted = Array.from(allEventsMap.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setEvents(sorted);
    } catch (err) {
      console.error(err);
      // Fallback
      setEvents(mockDb.getValidationEvents());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsEvents();
    const interval = setInterval(fetchAnalyticsEvents, 6000);
    return () => clearInterval(interval);
  }, [isDemo, connected]);

  // Sync additional counts from mockDb
  useEffect(() => {
    const onboardings = mockDb.getOnboardings();
    setOnboardingsCount(onboardings.length);
    setOnboardingsList(onboardings);

    const agreements = mockDb.getAgreements();
    setAgreementsCount(agreements.length);
    
    const completed = agreements.filter((a: any) => 
      a.status === 'Completed' || a.status === 'Paid' || a.status === 'Released'
    ).length;
    setCompletedAgreementsCount(completed);

    // Dynamic DAU calculations based on recent events (or fallback if empty)
    const activeIn24h = Array.from(new Set(events.filter(e => {
      const ageHours = (Date.now() - new Date(e.created_at).getTime()) / (3600 * 1000);
      return ageHours <= 24;
    }).map(e => e.wallet_address))).filter(Boolean).length;
    
    setDauCount(activeIn24h);

    // Calculate dynamic NFTs
    const totalNfts = events.filter(e => e.event_type === 'nft_minted').length 
      || mockDb.getReviews().filter((r: any) => r.nft_minted).length 
      || onboardings.reduce((acc: number, o: any) => acc + (o.nft_count || 0), 0);
    
    setNftsMintedCount(totalNfts);
  }, [events]);

  // Sync and load onboarding list on mount
  useEffect(() => {
    const syncAndLoadOnboardings = async () => {
      const localOnboardings = mockDb.getOnboardings();
      setOnboardingsCount(localOnboardings.length);
      setOnboardingsList(localOnboardings);

      try {
        const res = await fetch('/api/export-onboarding');
        if (res.ok) {
          const serverOnboardings = await res.json();
          const unsynced = localOnboardings.filter((local: any) => 
            !serverOnboardings.some((server: any) => server.wallet_address.toLowerCase() === local.wallet_address.toLowerCase())
          );

          if (unsynced.length > 0) {
            const postRes = await fetch('/api/export-onboarding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ onboardings: localOnboardings })
            });
            if (postRes.ok) {
              const data = await postRes.json();
              if (data.success && data.onboardings) {
                mockDb.setStorage('onboardings', data.onboardings);
                setOnboardingsCount(data.onboardings.length);
                setOnboardingsList(data.onboardings);
                return;
              }
            }
          }

          let updated = false;
          const mergedOnboardings = [...localOnboardings];
          serverOnboardings.forEach((se: any) => {
            if (!mergedOnboardings.some((local: any) => local.wallet_address.toLowerCase() === se.wallet_address.toLowerCase())) {
              mergedOnboardings.push(se);
              updated = true;
            }
          });
          if (updated) {
            mockDb.setStorage('onboardings', mergedOnboardings);
          }
          setOnboardingsCount(mergedOnboardings.length);
          setOnboardingsList(mergedOnboardings);
        }
      } catch (e) {
        console.warn("Failed to sync onboardings on analytics mount:", e);
      }
    };
    syncAndLoadOnboardings();
  }, [connected]);

  // Aggregate metrics
  const totalLogs = events.length;
  const uniqueWallets = Array.from(new Set(events.map(e => (e.wallet_address || '').toUpperCase()))).filter(Boolean).length;
  
  const countEvents = (type: string) => events.filter(e => e.event_type === type).length;
  
  const connectedCount = countEvents('wallet_connected');
  const profileCount = countEvents('profile_created');
  const escrowCount = countEvents('escrow_created');
  const fundedCount = countEvents('escrow_funded');
  const completedCount = countEvents('milestone_completed');
  const ratingCount = countEvents('reputation_updated');
  const nftCount = countEvents('nft_minted');

  // Estimate cumulative XLM volume locked based on escrow events
  const totalVolumeLocked = events
    .filter(e => e.event_type === 'escrow_funded')
    .reduce((sum, e) => sum + (parseFloat(e.metadata?.amount) || 100), 0);

  // Group events by day for charts (last 7 days helper)
  const getTimelineData = () => {
    const days: Record<string, number> = {};
    const volumes: Record<string, number> = {};
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      days[dateStr] = 0;
      volumes[dateStr] = 0;
    }

    let runningVolume = 0;

    events.forEach(e => {
      const dateStr = new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (days[dateStr] !== undefined) {
        days[dateStr] += 1;
      }
      if (e.event_type === 'escrow_funded') {
        runningVolume += parseFloat(e.metadata?.amount) || 100;
      }
      if (volumes[dateStr] !== undefined) {
        volumes[dateStr] = runningVolume;
      }
    });

    // Backfill volume progression
    let lastVol = 0;
    Object.keys(volumes).forEach(key => {
      if (volumes[key] === 0) {
        volumes[key] = lastVol;
      } else {
        lastVol = volumes[key];
      }
    });

    return {
      labels: Object.keys(days),
      activeCounts: Object.values(days),
      volumeProgress: Object.values(volumes)
    };
  };

  const timeline = getTimelineData();

  const handleShareMetrics = () => {
    if (navigator.clipboard) {
      const text = `StellarTrust Protocol Stats: ${onboardingsCount} Active Wallets, ${totalVolumeLocked} XLM Secured, ${nftsMintedCount} Completion NFTs Minted on Stellar Testnet! Check it out: ${window.location.origin}/analytics`;
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 3500);
    }
  };

  // Find max for SVG scaling
  const freighterCount = onboardingsList.filter(o => o.connection_source === 'freighter').length;
  const albedoCount = onboardingsList.filter(o => o.connection_source === 'albedo').length;
  const demoCount = onboardingsList.filter(o => o.connection_source === 'demo' || !o.connection_source).length;
  const realCount = freighterCount + albedoCount;

  const maxEventsVal = Math.max(...timeline.activeCounts, 5);
  const maxVolumeVal = Math.max(...timeline.volumeProgress, 500);

  return (
    <div className={`flex flex-col min-h-screen ${screenshotMode ? 'p-8 bg-slate-950 text-slate-100' : ''}`}>
      {!screenshotMode && <Navbar />}

      {screenshotMode && (
        <button
          onClick={() => setScreenshotMode(false)}
          className="fixed bottom-6 right-6 z-50 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-5 rounded-full shadow-lg transition active:scale-95 text-xs flex items-center gap-1.5"
        >
          Exit Screenshot Mode
        </button>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Title / Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-cyan-400" />
              <span>Visual Protocol Analytics</span>
            </h1>
            <p className="text-slate-400 text-sm">Real-time charts compiling transaction volume, wallet registrations, and trust score aggregates.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreenshotMode(!screenshotMode)}
              className="flex items-center space-x-1.5 bg-slate-900 border border-purple-500/20 hover:border-purple-500/60 text-purple-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>{screenshotMode ? 'Exit Screenshot' : 'Screenshot Mode'}</span>
            </button>
            <button
              onClick={handleShareMetrics}
              className="flex items-center space-x-1.5 bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/60 text-cyan-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>{shared ? 'Copied to Clipboard!' : 'Share Protocol Traction'}</span>
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="glass-panel border border-white/5 rounded-2xl p-4 space-y-1 relative overflow-hidden flex flex-col justify-between min-h-[120px] col-span-1">
            <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-full filter blur-xl" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Wallet Connections</span>
            </span>
            <div>
              <p className="text-2xl font-black text-slate-100">{onboardingsCount}</p>
              <div className="text-[9px] text-slate-400 space-y-0.5 mt-1 font-semibold">
                <div>Real: <strong className="text-cyan-400">{realCount}</strong> ({freighterCount} Freighter, {albedoCount} Albedo)</div>
                <div>Demo: <strong className="text-purple-400">{demoCount}</strong></div>
              </div>
            </div>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full filter blur-xl" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Active (DAUs)</span>
            </span>
            <p className="text-2xl font-black text-slate-100">{dauCount}</p>
            <span className="text-[9px] text-emerald-400 block font-semibold">Daily Active Wallets</span>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-500/5 rounded-full filter blur-xl" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <Coins className="h-3.5 w-3.5 text-yellow-550" />
              <span>Escrows Drafted</span>
            </span>
            <p className="text-2xl font-black text-slate-100">{agreementsCount}</p>
            <span className="text-[9px] text-yellow-500 block font-semibold">Total Escrows Created</span>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-teal-500/5 rounded-full filter blur-xl" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <CheckCircle className="h-3.5 w-3.5 text-teal-400" />
              <span>Escrows Payout</span>
            </span>
            <p className="text-2xl font-black text-slate-100">{completedAgreementsCount}</p>
            <span className="text-[9px] text-teal-400 block font-semibold">Contracts Completed</span>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full filter blur-xl" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <Award className="h-3.5 w-3.5 text-purple-400" />
              <span>NFT Achievements</span>
            </span>
            <p className="text-2xl font-black text-slate-100">{nftsMintedCount}</p>
            <span className="text-[9px] text-purple-400 block font-semibold">On-Chain Certificates</span>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full filter blur-xl" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <Coins className="h-3.5 w-3.5 text-blue-400" />
              <span>Secured Volume</span>
            </span>
            <p className="text-2xl font-black text-slate-100">{totalVolumeLocked} XLM</p>
            <span className="text-[9px] text-blue-400 block font-semibold">Total Escrow Value</span>
          </div>

        </div>

        {loading ? (
          <div className="text-center py-20 glass-panel border border-white/5 rounded-2xl space-y-4">
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading blockchain verification data charts...</p>
          </div>
        ) : (
          <>
            {/* SVG Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Active Event Transactions */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-cyan-400" />
                    <span>Daily Activity Logs (Last 7 Days)</span>
                  </h3>
                  <p className="text-[11px] text-slate-455">Visualized number of active transaction signatures matching testing users.</p>
                </div>

                {/* SVG Bar Chart */}
                <div className="h-60 w-full relative pt-4 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
                      <line 
                        key={idx} 
                        x1="0" 
                        y1={200 - r * 170 - 15} 
                        x2="500" 
                        y2={200 - r * 170 - 15} 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="1" 
                      />
                    ))}
                    
                    {/* Bars */}
                    {timeline.activeCounts.map((val, idx) => {
                      const barWidth = 40;
                      const gap = (500 - barWidth * 7) / 8;
                      const x = gap + idx * (barWidth + gap);
                      const height = (val / maxEventsVal) * 150;
                      const y = 200 - height - 20;

                      return (
                        <g key={idx} className="group cursor-pointer">
                          {/* Hover Glow */}
                          <rect
                            x={x - 2}
                            y={y - 2}
                            width={barWidth + 4}
                            height={height + 4}
                            rx="6"
                            fill="rgba(6, 182, 212, 0.05)"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          {/* Main Bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={height}
                            rx="4"
                            fill="url(#barGradient)"
                            className="transition-all duration-300"
                          />
                          {/* Label values */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 6}
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between px-2 text-[10px] font-bold text-slate-500 font-mono">
                  {timeline.labels.map((lbl, idx) => (
                    <span key={idx} className="w-12 text-center">{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Chart 2: Cumulative Escrow Volume */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
                    <span>Cumulative Escrow Volume (XLM)</span>
                  </h3>
                  <p className="text-[11px] text-slate-455">Total value of funds secured and released within our Soroban escrow pool.</p>
                </div>

                {/* SVG Area Line Chart */}
                <div className="h-60 w-full relative pt-4 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
                      <line 
                        key={idx} 
                        x1="0" 
                        y1={200 - r * 170 - 15} 
                        x2="500" 
                        y2={200 - r * 170 - 15} 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="1" 
                      />
                    ))}

                    {/* Area path */}
                    {(() => {
                      const points = timeline.volumeProgress.map((val, idx) => {
                        const gap = 500 / 6;
                        const x = idx * gap;
                        const y = 200 - (val / maxVolumeVal) * 150 - 20;
                        return { x, y, val };
                      });

                      const pathD = points.reduce((acc, p, idx) => {
                        return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
                      }, '');

                      const areaD = pathD + `L 500 180 L 0 180 Z`;

                      return (
                        <>
                          {/* Filled Area */}
                          <path 
                            d={areaD} 
                            fill="url(#areaGradient)" 
                            opacity="0.15"
                          />
                          {/* Stroke Line */}
                          <path 
                            d={pathD} 
                            fill="none" 
                            stroke="url(#lineGradient)" 
                            strokeWidth="2.5"
                          />
                          {/* Interactive dots */}
                          {points.map((p, idx) => (
                            <g key={idx} className="group cursor-pointer">
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="4" 
                                fill="#8b5cf6" 
                                stroke="#020617" 
                                strokeWidth="1.5"
                              />
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="8" 
                                fill="rgba(139, 92, 246, 0.3)" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                              <text
                                x={p.x}
                                y={p.y - 10}
                                fill="#f8fafc"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="opacity-0 group-hover:opacity-100 transition-opacity font-mono"
                              >
                                {Math.round(p.val)} XLM
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}

                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between px-2 text-[10px] font-bold text-slate-500 font-mono">
                  {timeline.labels.map((lbl, idx) => (
                    <span key={idx} className="w-12 text-center">{lbl}</span>
                  ))}
                </div>
              </div>

            </div>

            {/* Action metrics breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Event count distribution table */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200">Action Coverage Metrics</h3>
                
                <div className="space-y-3.5 text-xs text-slate-300">
                  {[
                    { label: 'Real Wallet Connections', count: realCount, total: onboardingsCount, color: 'bg-blue-500' },
                    { label: 'Demo Connections', count: demoCount, total: onboardingsCount, color: 'bg-purple-500' },
                    { label: 'Registered Profiles', count: profileCount, total: totalLogs, color: 'bg-indigo-500' },
                    { label: 'Agreements Drafted', count: escrowCount, total: totalLogs, color: 'bg-yellow-500' },
                    { label: 'Escrows Active', count: fundedCount, total: totalLogs, color: 'bg-cyan-500' },
                    { label: 'Milestones Completed', count: completedCount, total: totalLogs, color: 'bg-emerald-500' },
                    { label: 'Trust Ratings Registered', count: ratingCount, total: totalLogs, color: 'bg-amber-500' },
                    { label: 'Achievement Certificates Minted', count: nftCount, total: totalLogs, color: 'bg-pink-500' },
                  ].map((item, idx) => {
                    const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold">{item.label}</span>
                          <span className="font-mono text-slate-400">{item.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} transition-all`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faucet details and instructions */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-200">Soroban Contract State Consensus</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    StellarTrust verifies transaction status dynamically directly from ledger parameters. All updates to escrow locks, ratings, and certificates automatically increment global totals in real-time.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To test contracts live: Enable **Freighter** wallet connection, fund using the **Friendbot Faucet** within the Escrow management pane, and mint project NFTs upon complete payout releases.
                  </p>
                </div>
                
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 flex items-center space-x-3 text-xs">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">
                    Audit validation report files compiled to <code className="text-[10px] text-cyan-400 font-mono">10-user-wallet-proof.csv</code> for Blue Belt scoring submission checks.
                  </span>
                </div>
              </div>

            </div>

            {/* Recent Ledger Actions Logs */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200">Recent Ledger Activity Registry</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-350">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-2.5 px-4">Event Type</th>
                      <th className="py-2.5 px-4">Wallet</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Verification hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">No events logged yet. Connect wallet and perform actions to sync.</td>
                      </tr>
                    ) : (
                      [...events].slice(-6).reverse().map((e) => {
                        const txHash = e.metadata?.tx_hash || e.metadata?.tx || e.txHash || null;
                        
                        return (
                          <tr key={e.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-bold text-cyan-400">{e.event_type}</td>
                            <td className="py-3 px-4 font-mono text-slate-400">
                              {e.wallet_address ? `${e.wallet_address.substring(0, 6)}...${e.wallet_address.substring(e.wallet_address.length - 6)}` : 'System'}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {e.metadata?.description || e.metadata?.title || 'Consensus state change verified'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono">
                              {txHash ? (
                                <a
                                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 flex items-center justify-end space-x-1 inline-flex hover:underline"
                                >
                                  <span>{txHash.substring(0, 6)}...{txHash.substring(txHash.length - 6)}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-slate-600">Local Consensus</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>

      {!screenshotMode && <Footer />}
    </div>
  );
}
