'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStellar, WalletType } from '@/hooks/useStellar';
import { mockDb } from '@/lib/supabase';
import { 
  ShieldAlert, 
  Wallet, 
  Bell, 
  CheckCircle, 
  Laptop, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { 
    address, 
    connected, 
    connecting, 
    isDemo, 
    userProfile, 
    connectWallet, 
    disconnectWallet, 
    toggleDemo,
    error
  } = useStellar();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  useEffect(() => {
    if (address) {
      setNotifications(mockDb.getNotifications(address));
      
      // Poll notifications every 5 seconds in mock mode
      const interval = setInterval(() => {
        setNotifications(mockDb.getNotifications(address));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = () => {
    if (address) {
      mockDb.markNotificationsRead(address);
      setNotifications(mockDb.getNotifications(address));
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Escrow', href: '/escrow' },
    { name: 'Reputation', href: '/reputation' },
    { name: 'NFT Gallery', href: '/gallery' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Feedback', href: '/feedback' },
    { name: 'Improvements', href: '/improvements' },
    { name: 'Blue Belt', href: '/blue-belt' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                StellarTrust
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400 bg-white/5 border border-white/5 shadow-md shadow-cyan-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Demo Mode Toggle */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Demo Mode</span>
              <button
                onClick={toggleDemo}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDemo ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isDemo ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              {isDemo && (
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>

            {/* Notification Bell */}
            {connected && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    if (!showNotifDropdown) handleMarkRead();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/5 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 glass-panel border border-white/10 rounded-xl shadow-2xl p-4 text-left z-50">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                      <h4 className="font-bold text-sm text-slate-200">Alerts</h4>
                      <span className="text-xs text-slate-500">Real-time Sync</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="text-xs p-2 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                            <p>{n.message}</p>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              {new Date(n.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Button */}
            {connected && address ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletOptions(!showWalletOptions)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-950 to-purple-950 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-semibold hover:border-cyan-500/60 transition-all duration-200"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-200">
                    {address.substring(0, 4)}...{address.substring(address.length - 4)}
                  </span>
                  {userProfile?.username && (
                    <span className="text-cyan-400 text-xs">(@{userProfile.username})</span>
                  )}
                </button>

                {showWalletOptions && (
                  <div className="absolute right-0 mt-2 w-48 glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <Link
                      href="/settings"
                      onClick={() => setShowWalletOptions(false)}
                      className="flex items-center space-x-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <User className="h-4 w-4 text-cyan-400" />
                      <span>Edit Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowWalletOptions(false);
                      }}
                      className="flex items-center space-x-2 w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-950/20 transition-colors border-t border-white/5"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => connectWallet(WalletType.FREIGHTER)}
                disabled={connecting}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 shadow-lg shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Simple Indicator */}
            {isDemo && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                DEMO
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 bg-slate-950/95 py-2 px-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                  isActive ? 'bg-white/5 text-cyan-400' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="border-t border-white/10 my-2 pt-2">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-lg">
              <span className="text-sm font-semibold text-slate-400">Demo Mode</span>
              <button
                onClick={toggleDemo}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDemo ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isDemo ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            {connected && address ? (
              <div className="mt-2 px-3 py-2 text-slate-400 text-xs">
                <span>Addr: {address.substring(0, 8)}...{address.substring(address.length - 8)}</span>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setIsOpen(false);
                  }}
                  className="mt-2 w-full bg-rose-950/40 border border-rose-800 text-rose-400 py-2 rounded-lg font-bold flex items-center justify-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet(WalletType.FREIGHTER);
                  setIsOpen(false);
                }}
                className="mt-2 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center space-x-1"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/95 border-t border-rose-800 text-rose-200 px-4 py-3 text-sm flex items-start space-x-3 w-full font-mono max-h-40 overflow-y-auto">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">WALLET CONNECTION ERROR DETECTED:</p>
            <pre className="whitespace-pre-wrap text-xs font-mono">{error}</pre>
          </div>
        </div>
      )}
    </nav>
  );
}
