'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Rocket,
  Wallet,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Coins,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// ============================================================
// 🔧 CONFIGURATION — Google Form & Sheet URLs
// ============================================================
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSetNsI2qsv4WyTasqkwC8sH9CWP_q5j5-9HHcofRZj_s-J2DQ/viewform?embedded=true';
const GOOGLE_FORM_DIRECT_LINK = 'https://forms.gle/Z5RX5MhNgkDhK8hY9';
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dn8s1d318aTa36IwnHCz4sJYCw6tLXu7GcldzEu_Rnk/edit?usp=sharing';
// ============================================================

export default function OnboardPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const steps = [
    {
      number: '01',
      title: 'Install Freighter Wallet',
      icon: <Wallet className="h-5 w-5" />,
      color: 'cyan',
      description: 'Download and set up the Freighter browser extension to interact with the Stellar network.',
      details: (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm leading-relaxed">
            Freighter is a non-custodial Stellar wallet that lives in your browser. It lets you sign transactions securely without sharing your private key.
          </p>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-950/60 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Download Freighter
          </a>
          <p className="text-slate-500 text-xs">
            After installing, create a new wallet and <strong>switch to Testnet</strong> in Freighter Settings → Network → Testnet.
          </p>
        </div>
      )
    },
    {
      number: '02',
      title: 'Fund Your Testnet Wallet',
      icon: <Coins className="h-5 w-5" />,
      color: 'purple',
      description: 'Get free testnet XLM from the Stellar Friendbot to start using StellarTrust.',
      details: (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm leading-relaxed">
            Copy your Freighter wallet address (starts with <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded text-xs">G...</code>) and use the Stellar Friendbot to fund it with 10,000 test XLM.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://laboratory.stellar.org/#account-creator?network=test"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-950/40 border border-purple-800/50 text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-950/60 transition"
            >
              <ExternalLink className="h-4 w-4" />
              Stellar Laboratory Friendbot
            </a>
          </div>
          <p className="text-slate-500 text-xs">
            Paste your wallet address and click &quot;Get test network lumens&quot;. You&apos;ll receive 10,000 XLM instantly.
          </p>
        </div>
      )
    },
    {
      number: '03',
      title: 'Connect & Use StellarTrust',
      icon: <Shield className="h-5 w-5" />,
      color: 'blue',
      description: 'Connect your wallet to StellarTrust and try out escrow, reputation, and NFT features.',
      details: (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm leading-relaxed">
            Click &quot;Connect Wallet&quot; in the navbar, then explore these features:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/settings" className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition text-sm text-slate-300">
              <ClipboardCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Create your profile</span>
            </Link>
            <Link href="/escrow" className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition text-sm text-slate-300">
              <Coins className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Create an escrow agreement</span>
            </Link>
            <Link href="/reputation" className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition text-sm text-slate-300">
              <Shield className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Check trust scores</span>
            </Link>
            <Link href="/gallery" className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition text-sm text-slate-300">
              <Award className="h-4 w-4 text-amber-400 shrink-0" />
              <span>View NFT certificates</span>
            </Link>
          </div>
        </div>
      )
    },
    {
      number: '04',
      title: 'Submit Your Feedback',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'emerald',
      description: 'Fill out the feedback form below to share your experience and help us improve.',
      details: (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm leading-relaxed">
            Scroll down to the Google Form below and fill in your details. Your feedback directly shapes the next version of StellarTrust!
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-950/60 transition"
            >
              <MessageSquare className="h-4 w-4" />
              In-App Feedback Form
            </Link>
            <a
              href={GOOGLE_FORM_DIRECT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-semibold hover:bg-white/10 transition"
            >
              <ExternalLink className="h-4 w-4" />
              Open Google Form Directly
            </a>
          </div>
        </div>
      )
    }
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    cyan: { bg: 'bg-cyan-950/40', border: 'border-cyan-800/40', text: 'text-cyan-400' },
    purple: { bg: 'bg-purple-950/40', border: 'border-purple-800/40', text: 'text-purple-400' },
    blue: { bg: 'bg-blue-950/40', border: 'border-blue-800/40', text: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', text: 'text-emerald-400' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 h-96 w-96 bg-cyan-500/[0.08] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-purple-500/[0.08] rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-cyan-500/20 px-4 py-2 rounded-full text-xs font-bold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Stellar Testnet — Free to use, no real funds needed</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Get Started with
              </span>
              <br />
              <span className="text-white">StellarTrust</span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Join our testnet community in 3 minutes. Connect a wallet, explore decentralized escrow &amp; reputation, and share your feedback.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a
                href="#steps"
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition active:scale-95 shadow-lg shadow-cyan-950/40 flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" />
                Start Onboarding
              </a>
              <a
                href="#feedback-form"
                className="px-8 py-3.5 bg-slate-900 border border-white/10 text-slate-200 font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                Submit Feedback
              </a>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-white/5 bg-slate-900/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white">4</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Smart Contracts</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white">50+</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Testnet Users</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white">0%</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Fees</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white">~3 min</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Setup Time</span>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Steps */}
        <section id="steps" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                4 Simple Steps
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Follow this guide to set up your wallet, explore StellarTrust, and submit your feedback.
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const colors = colorClasses[step.color];
                const isExpanded = expandedStep === index;
                return (
                  <div
                    key={index}
                    className={`glass-panel border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? `${colors.border} shadow-lg` : 'border-white/10'
                      }`}
                  >
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : index)}
                      className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-white/5 transition"
                    >
                      <div className={`p-3 ${colors.bg} border ${colors.border} rounded-xl shrink-0`}>
                        <span className={colors.text}>{step.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-black ${colors.text} uppercase tracking-widest`}>
                            Step {step.number}
                          </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-100">{step.title}</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{step.description}</p>
                      </div>
                      <div className={`shrink-0 ${colors.text}`}>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-white/5">
                        <div className="pt-4">
                          {step.details}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Google Form Embed Section */}
        <section id="feedback-form" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 px-4 py-2 rounded-full text-xs font-bold text-emerald-400 mb-4">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Step 4 — Submit Your Feedback</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                User Feedback Form
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Fill out the form below to share your details and rate StellarTrust. All responses are collected in a Google Sheet for analysis.
              </p>
            </div>

            {/* Google Form iFrame Container */}
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/60" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-3 text-xs font-mono text-slate-500">Google Forms — StellarTrust Feedback</span>
                </div>
                <a
                  href={GOOGLE_FORM_DIRECT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  Open in new tab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="bg-white rounded-b-2xl">
                <iframe
                  src={GOOGLE_FORM_URL}
                  width="100%"
                  height="900"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="w-full"
                  title="StellarTrust User Feedback Form"
                >
                  Loading Google Form…
                </iframe>
              </div>
            </div>

            {/* Alternative Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <a
                href={GOOGLE_FORM_DIRECT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
              >
                <ExternalLink className="h-4 w-4" />
                Can&apos;t see the form? Open it directly
              </a>
              <span className="text-slate-700">|</span>
              <a
                href={GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
              >
                <ClipboardCheck className="h-4 w-4" />
                View all responses (Google Sheet)
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Already submitted? Explore more features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/pitch"
                className="p-5 glass-panel border border-white/10 rounded-2xl hover:border-cyan-500/30 transition group text-center"
              >
                <Sparkles className="h-6 w-6 text-cyan-400 mx-auto mb-2 group-hover:animate-pulse" />
                <h3 className="font-bold text-sm text-slate-200">Pitch Deck</h3>
                <p className="text-xs text-slate-500 mt-1">See our vision &amp; roadmap</p>
              </Link>
              <Link
                href="/improvements"
                className="p-5 glass-panel border border-white/10 rounded-2xl hover:border-purple-500/30 transition group text-center"
              >
                <CheckCircle2 className="h-6 w-6 text-purple-400 mx-auto mb-2 group-hover:animate-pulse" />
                <h3 className="font-bold text-sm text-slate-200">Improvements</h3>
                <p className="text-xs text-slate-500 mt-1">Changes from user feedback</p>
              </Link>
              <Link
                href="/dashboard"
                className="p-5 glass-panel border border-white/10 rounded-2xl hover:border-blue-500/30 transition group text-center"
              >
                <Rocket className="h-6 w-6 text-blue-400 mx-auto mb-2 group-hover:animate-pulse" />
                <h3 className="font-bold text-sm text-slate-200">Dashboard</h3>
                <p className="text-xs text-slate-500 mt-1">Your escrows &amp; reputation</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
