'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  Star, 
  MessageSquare, 
  Download, 
  User, 
  Mail, 
  Wallet, 
  Send, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function FeedbackPage() {
  const { address, connected } = useStellar();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [featureRequest, setFeatureRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);

  // Sync wallet address if connected
  useEffect(() => {
    if (connected && address) {
      setWalletAddress(address);
    }
  }, [connected, address]);

  // Load feedbacks
  const loadFeedbacks = async () => {
    const localFeedbacks = mockDb.getFeedback();
    setFeedbacksList(localFeedbacks);

    try {
      const res = await fetch('/api/export-feedback');
      if (res.ok) {
        const serverFeedbacks = await res.json();
        
        let updated = false;
        const merged = [...localFeedbacks];
        serverFeedbacks.forEach((sf: any) => {
          if (!merged.some((lf: any) => lf.id === sf.id)) {
            merged.push(sf);
            updated = true;
          }
        });
        if (updated) {
          mockDb.setStorage('feedback', merged);
        }
        setFeedbacksList(merged);
      }
    } catch (e) {
      console.warn("Failed to fetch server feedback:", e);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMessage({ type: 'error', text: 'A valid email is required' });
      return;
    }
    if (!walletAddress.trim() || !walletAddress.startsWith('G')) {
      setMessage({ type: 'error', text: 'Valid Stellar Wallet Address (starting with G) is required' });
      return;
    }
    if (!feedbackText.trim()) {
      setMessage({ type: 'error', text: 'Feedback text is required' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const newFeedback = {
      id: Math.random().toString(36).substring(2, 11),
      name: name.trim(),
      email: email.trim(),
      user_address: walletAddress.trim(),
      rating,
      comment: feedbackText.trim(),
      feature_request: featureRequest.trim(),
      created_at: new Date().toISOString()
    };

    try {
      // 1. Add locally
      mockDb.addFeedback(newFeedback);
      
      // 2. Post to API to sync with dev server disk & generate CSV
      const currentFeedbacks = mockDb.getFeedback();
      const res = await fetch('/api/export-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbacks: currentFeedbacks })
      });
      const data = await res.json();
      
      if (data.success) {
        // Sync database state from disk merge
        mockDb.setStorage('feedback', data.feedbacks);
        setMessage({ type: 'success', text: 'Feedback successfully submitted & synced to evidence files!' });
        setName('');
        setEmail('');
        setFeedbackText('');
        setFeatureRequest('');
        loadFeedbacks();
      } else {
        setMessage({ type: 'success', text: 'Feedback submitted locally (fallback mode).' });
        setName('');
        setEmail('');
        setFeedbackText('');
        setFeatureRequest('');
        loadFeedbacks();
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      // Fail-safe fallback to local storage
      setMessage({ type: 'success', text: 'Feedback submitted locally.' });
      setName('');
      setEmail('');
      setFeedbackText('');
      setFeatureRequest('');
      loadFeedbacks();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvHeaders = ['id', 'name', 'email', 'wallet_address', 'rating', 'feedback_text', 'feature_request', 'created_at'];
    const csvRows = feedbacksList.map((fb: any) => {
      const id = fb.id || '';
      const name = fb.name || '';
      const email = fb.email || '';
      const wallet = fb.user_address || fb.wallet_address || '';
      const rating = fb.rating || 5;
      const text = fb.comment || fb.feedback_text || '';
      const req = fb.feature_request || '';
      const date = fb.created_at || '';
      return [id, name, email, wallet, rating, text, req, date];
    });

    const csvContent = [
      csvHeaders.join(','), 
      ...csvRows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'blue-belt-feedback.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
            Feedback Collection System
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Provide feedback, ratings, and feature requests. Your verification helps us prove active validation for our Blue Belt criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Feedback Form Panel */}
          <div className="lg:col-span-7 glass-panel border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-cyan-400" />
                Submit Validation Feedback
              </h2>

              {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 border ${
                  message.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
                    : 'bg-rose-950/40 border-rose-800 text-rose-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name-input" className="block text-sm font-semibold text-slate-300 mb-2">
                      Validator Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        id="name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email-input" className="block text-sm font-semibold text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. validator@stellar.org"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Wallet */}
                <div>
                  <label htmlFor="wallet-input" className="block text-sm font-semibold text-slate-300 mb-2">
                    Stellar Wallet Address
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="wallet-input"
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="e.g. GAC3R6W2F2NY7F75DEXW..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-sm transition"
                    />
                  </div>
                  {connected && address && (
                    <span className="text-[11px] text-cyan-400 block mt-1">
                      ✓ Pre-filled from your connected wallet session
                    </span>
                  )}
                </div>

                {/* Product Rating (1-5) */}
                <div>
                  <span className="block text-sm font-semibold text-slate-300 mb-3">
                    Product Rating
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 rounded-lg hover:bg-white/5 transition"
                      >
                        <Star 
                          className={`h-8 w-8 transition-colors ${
                            star <= rating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div>
                  <label htmlFor="feedback-text" className="block text-sm font-semibold text-slate-300 mb-2">
                    Feedback Text / Comments
                  </label>
                  <textarea
                    id="feedback-text"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide your detailed feedback about UI usability, contract logic, or general stability..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                {/* Feature Request */}
                <div>
                  <label htmlFor="feature-request" className="block text-sm font-semibold text-slate-300 mb-2">
                    Feature Request (Optional)
                  </label>
                  <input
                    id="feature-request"
                    type="text"
                    value={featureRequest}
                    onChange={(e) => setFeatureRequest(e.target.value)}
                    placeholder="e.g. Add multisig escrows, or automatic recurring milestone payments"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Stats, CSV Download, Live Stream */}
          <div className="lg:col-span-5 space-y-6">
            {/* Export and Stats Card */}
            <div className="glass-panel border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span>Feedback Analytics</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full">
                  Level 5 Evidence
                </span>
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Validators collect these reviews as proof of product evaluation. You can export the aggregate dataset as a standard CSV format.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl text-center">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</span>
                  <span className="text-3xl font-extrabold text-slate-200 mt-1 block">{feedbacksList.length}</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl text-center">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</span>
                  <span className="text-3xl font-extrabold text-amber-400 mt-1 block">
                    {feedbacksList.length > 0 
                      ? (feedbacksList.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacksList.length).toFixed(1)
                      : '5.0'}★
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadCSV}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4 text-cyan-400" />
                <span>Export blue-belt-feedback.csv</span>
              </button>
            </div>

            {/* Live stream */}
            <div className="glass-panel border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-200 mb-4">
                Recent Submissions Stream
              </h3>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {feedbacksList.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No feedback submissions found.</p>
                ) : (
                  [...feedbacksList].reverse().slice(0, 5).map((fb) => (
                    <div key={fb.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">
                            {fb.name || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {fb.user_address ? `${fb.user_address.substring(0, 6)}...${fb.user_address.substring(fb.user_address.length - 6)}` : 'No wallet'}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs italic">
                        "{fb.comment || fb.feedback_text}"
                      </p>
                      {fb.feature_request && (
                        <div className="text-[11px] text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/60">
                          <span className="font-semibold">Feature Request:</span> {fb.feature_request}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
