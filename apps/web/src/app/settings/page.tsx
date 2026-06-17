'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStellar } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  User, 
  FileText, 
  Tag, 
  Briefcase, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';

export default function Settings() {
  const { address, connected, userProfile, registerProfile, verifyProfile } = useStellar();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer' | 'both'>('both');
  const [skillsStr, setSkillsStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load existing profile details
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setRole(userProfile.role || 'both');
      setSkillsStr(userProfile.skills?.join(', ') || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !address) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Username is required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const skills = skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await registerProfile(username.trim(), bio.trim(), skills, role);
      setMessage({ type: 'success', text: 'Profile updated successfully on-chain!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!address) return;
    try {
      const res = await verifyProfile(address);
      const txHash = res?.txHash || (res && typeof res === 'object' ? res.txHash : null);
      if (txHash) {
        setMessage({ 
          type: 'success', 
          text: `Profile identity verified successfully by contract oracle! Tx Hash: ${txHash}` 
        });
      } else {
        setMessage({ type: 'success', text: 'Profile identity verified successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Verification failed' });
    }
  };

  const availableSkills = ['React', 'Next.js', 'Rust', 'Soroban', 'Stellar SDK', 'Smart Contracts', 'Solidity', 'TypeScript', 'Node.js', 'PostgreSQL', 'UI Design'];

  const handleAddSkill = (skill: string) => {
    const skills = skillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (!skills.includes(skill)) {
      skills.push(skill);
      setSkillsStr(skills.join(', '));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Profile Settings</h1>
          <p className="text-slate-400 text-sm">Create and edit your decentralized freelance identity profile.</p>
        </div>

        {!connected ? (
          <div className="text-center py-16 glass-panel border border-white/5 rounded-2xl space-y-3">
            <AlertCircle className="h-10 w-10 text-cyan-400 mx-auto" />
            <p className="text-slate-400 text-sm">Please connect your wallet to manage your profile settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Left */}
            <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="john_doe"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Bio / Description</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Senior Full Stack Engineer & Soroban Smart Contract developer..."
                    rows={4}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>

                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Default Board Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'client', label: 'Client' },
                      { value: 'freelancer', label: 'Freelancer' },
                      { value: 'both', label: 'Both Roles' }
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setRole(opt.value as any)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                          role === opt.value 
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-900/60 border-white/5 hover:border-white/10 text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills tags input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    placeholder="React, Next.js, Rust, Soroban"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {availableSkills.map((sk) => (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => handleAddSkill(sk)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-md px-2 py-1 text-[10px] font-semibold text-slate-400 transition-colors"
                      >
                        + {sk}
                      </button>
                    ))}
                  </div>
                </div>

                {message && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
                    message.type === 'success' 
                      ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400' 
                      : 'bg-rose-950/20 border-rose-800/30 text-rose-400'
                  }`}>
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-sm rounded-xl hover:opacity-90 shadow-lg shadow-cyan-950/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'Updating Ledger Profile...' : 'Save Profile Details'}
                </button>

              </form>
            </div>

            {/* Verification Right Panel */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-200">KYC & Identity Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verify your account cryptographically on-chain to earn a validation checkmark. This boosts your Trust Score by 10 points and qualifies you for high-tier escrows.
                </p>
                <div className="flex flex-col space-y-2 pt-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Status:</span>
                    {userProfile?.verified ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        Verified Account
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800 text-[10px] font-bold">
                        Unverified
                      </span>
                    )}
                  </div>
                  {userProfile?.verified && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1 break-all leading-relaxed">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Tx Hash:</span>
                      {userProfile.verification_tx ? (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${userProfile.verification_tx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
                        >
                          {userProfile.verification_tx}
                        </a>
                      ) : (
                        <span className="text-slate-500">Verified via Local Database</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!userProfile?.verified && (
                <button
                  onClick={handleVerify}
                  className="w-full py-2.5 bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold text-xs rounded-xl hover:bg-slate-800/50 hover:border-cyan-500/60 transition-all flex items-center justify-center space-x-1"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Verify Identity Now</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
