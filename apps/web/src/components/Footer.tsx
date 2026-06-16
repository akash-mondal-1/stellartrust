'use client';

import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

export default function Footer() {
  const contracts = [
    { name: 'Identity Contract', envVar: 'NEXT_PUBLIC_IDENTITY_CONTRACT', addr: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT },
    { name: 'Escrow Contract', envVar: 'NEXT_PUBLIC_ESCROW_CONTRACT', addr: process.env.NEXT_PUBLIC_ESCROW_CONTRACT },
    { name: 'Reputation Contract', envVar: 'NEXT_PUBLIC_REPUTATION_CONTRACT', addr: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT },
    { name: 'Achievement NFT Contract', envVar: 'NEXT_PUBLIC_NFT_CONTRACT', addr: process.env.NEXT_PUBLIC_NFT_CONTRACT },
  ];

  return (
    <footer className="bg-slate-950/80 border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/5">
          {/* Logo and Pitch */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-md">
                <ShieldAlert className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                StellarTrust
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Securing agreements, payments, and professional reputation on the Stellar blockchain network. Custom designed for global freelancers and clients.
            </p>
          </div>

          {/* Soroban Contract addresses */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>Stellar Testnet Deployed Contracts</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {contracts.map((contract) => (
                <div 
                  key={contract.name} 
                  className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-300 block">{contract.name}</span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      {contract.addr ? `${contract.addr.substring(0, 16)}...${contract.addr.substring(contract.addr.length - 12)}` : 'Not loaded'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[9px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright & Sub-links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StellarTrust Protocol. Built for Green Belt Soroban Certification.</p>
          <div className="flex space-x-4 mt-4 md:mt-0 font-medium">
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Stellar Network</a>
            <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Soroban Docs</a>
            <a href="/admin" className="hover:text-cyan-400 transition-colors">Developer Sandbox</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
