'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { mockDb } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export enum WalletNetwork {
  PUBLIC = "PUBLIC",
  TESTNET = "TESTNET",
  SANDBOX = "SANDBOX"
}

export enum WalletType {
  FREIGHTER = "freighter",
  XBULL = "xbull",
}

export interface UserSession {
  address: string;
  username?: string;
  bio?: string;
  skills?: string[];
  role?: 'client' | 'freelancer' | 'both';
  rating?: number;
  trust_score?: number;
  verified?: boolean;
}

interface StellarContextType {
  address: string | null;
  connecting: boolean;
  connected: boolean;
  error: string | null;
  isDemo: boolean;
  userProfile: UserSession | null;
  connectWallet: (type: WalletType) => Promise<string>;
  disconnectWallet: () => void;
  toggleDemo: () => void;
  refreshProfile: (addr: string) => void;
  registerProfile: (username: string, bio: string, skills: string[], role: 'client' | 'freelancer' | 'both') => Promise<any>;
  verifyProfile: (wallet: string) => Promise<any>;
  createAgreement: (title: string, desc: string, freelancer: string, amount: number, milestoneCount: number, deadlineDays: number) => Promise<any>;
  fundEscrow: (agreementId: string) => Promise<any>;
  acceptAgreement: (agreementId: string) => Promise<any>;
  submitWork: (agreementId: string) => Promise<any>;
  approveWork: (agreementId: string) => Promise<any>;
  releasePayment: (agreementId: string) => Promise<any>;
  raiseDispute: (agreementId: string) => Promise<any>;
  refundClient: (agreementId: string) => Promise<any>;
  submitReview: (agreementId: string, rating: number, comment: string) => Promise<any>;
  mintNFT: (agreementId: string, freelancer: string, projectName: string) => Promise<any>;
}

const StellarContext = createContext<StellarContextType | null>(null);

if (typeof window !== 'undefined') {
  // Safe default initialization placeholder. Real modules loaded on client mount.
  StellarWalletsKit.init({
    modules: []
  });
}

export const StellarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [userProfile, setUserProfile] = useState<UserSession | null>(null);

  // Auto-load connected address or demo address
  useEffect(() => {
    // Safely load freighter and xbull modules client-side during mount
    try {
      const { FreighterModule } = require('@creit.tech/stellar-wallets-kit/modules/freighter');
      const { xBullModule } = require('@creit.tech/stellar-wallets-kit/modules/xbull');
      StellarWalletsKit.init({
        modules: [new FreighterModule(), new xBullModule()],
        network: 'TESTNET' as any
      });
    } catch (e) {
      console.warn('Failed to initialize StellarWalletsKit modules on client mount:', e);
    }

    const checkWalletsAndInit = async () => {
      let freighterActive = false;
      try {
        const freighterApi = require('@stellar/freighter-api');
        const check = await freighterApi.isConnected();
        freighterActive = !!check?.isConnected;
      } catch (e) {
        console.warn('Failed to query Freighter API isConnected on mount:', e);
      }

      let xbullActive = false;
      try {
        xbullActive = typeof window !== 'undefined' && (
          !!(window as any).xBull || 
          !!(window as any).xbull || 
          (typeof (window as any).stellar !== 'undefined' && (window as any).stellar?.provider === 'xbull')
        );
      } catch (e) {
        console.warn('Failed to query xBull presence on mount:', e);
      }

      const hasSupportedWallet = freighterActive || xbullActive;

      const savedDemo = localStorage.getItem('stellar_trust_demo_mode');
      const savedAddress = localStorage.getItem('stellar_trust_wallet_address');

      let currentDemo = true;
      if (savedDemo !== null) {
        currentDemo = savedDemo === 'true';
        setIsDemo(currentDemo);
      } else {
        // First visit: if a supported wallet exists, disable Demo Mode. Otherwise, enable it.
        currentDemo = !hasSupportedWallet;
        setIsDemo(currentDemo);
        localStorage.setItem('stellar_trust_demo_mode', String(currentDemo));
      }

      if (savedAddress) {
        setAddress(savedAddress);
        setConnected(true);
        refreshProfile(savedAddress);
      } else if (currentDemo) {
        // Setup a mock client profile for immediate demo use
        const demoClientAddress = 'GDEMOCLIENT6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT';
        setAddress(demoClientAddress);
        setConnected(true);
        localStorage.setItem('stellar_trust_wallet_address', demoClientAddress);
        refreshProfile(demoClientAddress);
      }
    };

    checkWalletsAndInit();
  }, []);

  const toggleDemo = () => {
    const newDemo = !isDemo;
    setIsDemo(newDemo);
    localStorage.setItem('stellar_trust_demo_mode', String(newDemo));
    
    // Switch to appropriate wallet when toggling
    if (newDemo) {
      const demoClientAddress = 'GDEMOCLIENT6Y54DDT4Q7G6F6UX6N5JLUWT8FCRNXZX6GTRUSTCLIENT';
      setAddress(demoClientAddress);
      setConnected(true);
      localStorage.setItem('stellar_trust_wallet_address', demoClientAddress);
      refreshProfile(demoClientAddress);
    } else {
      setAddress(null);
      setConnected(false);
      setUserProfile(null);
      localStorage.removeItem('stellar_trust_wallet_address');
    }
  };

  const refreshProfile = (walletAddr: string) => {
    const profile = mockDb.getProfile(walletAddr);
    if (profile) {
      setUserProfile(profile as UserSession);
    } else {
      setUserProfile({ address: walletAddr });
    }
  };

  const connectWallet = async (type: WalletType): Promise<string> => {
    setConnecting(true);
    setError(null);
    try {
      // ── STEP 1: Always re-initialize the kit with modules so activeModules is populated ──
      console.log("STEP 1: Re-initializing StellarWalletsKit with FreighterModule + xBullModule");
      const { FreighterModule } = require('@creit.tech/stellar-wallets-kit/modules/freighter');
      const { xBullModule } = require('@creit.tech/stellar-wallets-kit/modules/xbull');
      StellarWalletsKit.init({
        modules: [new FreighterModule(), new xBullModule()],
        network: 'TESTNET' as any,
      });
      console.log("STEP 1 OK: Kit initialized. Modules registered:", [
        new FreighterModule().productId,
        new xBullModule().productId,
      ]);

      // ── STEP 2: Resolve target wallet ID (must match module.productId exactly) ──
      // WalletType.FREIGHTER = "freighter" matches FreighterModule.productId = "freighter"
      // WalletType.XBULL = "xbull" matches xBullModule.productId = "xbull"
      const targetId: string = type; // WalletType values are already correct productIds
      console.log("STEP 2: targetId =", targetId, "| type passed =", type);

      // ── STEP 3: setWallet — select the module by productId ──
      console.log("STEP 3: Calling StellarWalletsKit.setWallet('" + targetId + "')");
      StellarWalletsKit.setWallet(targetId);
      console.log("STEP 3 OK: setWallet succeeded");

      // ── STEP 4: fetchAddress — actually invokes the module (triggers Freighter popup) ──
      // This calls FreighterModule.getAddress() internally which does:
      //   1. requestAccess() → opens Freighter popup
      //   2. getAddress() → returns the public key
      console.log("STEP 4: Calling StellarWalletsKit.fetchAddress() — this will trigger the wallet popup");
      let walletAddress = "";
      try {
        const result = await StellarWalletsKit.fetchAddress();
        console.log("STEP 4 OK: fetchAddress result =", result);
        walletAddress = result.address;
      } catch (fetchErr: any) {
        console.error("FULL WALLET ERROR - fetchAddress() failed:", fetchErr);
        throw fetchErr;
      }

      if (!walletAddress) {
        throw new Error("fetchAddress() returned empty address. User may have rejected the connection.");
      }

      // ── STEP 5: Persist connection ──
      console.log("STEP 5: Connection successful. Address =", walletAddress);
      setIsDemo(false);
      setAddress(walletAddress);
      setConnected(true);
      localStorage.setItem('stellar_trust_wallet_address', walletAddress);
      localStorage.setItem('stellar_trust_demo_mode', 'false');
      refreshProfile(walletAddress);

      trackEvent({
        wallet_address: walletAddress,
        event_type: 'wallet_connected',
        metadata: { wallet_type: targetId, mode: 'live' }
      });

      setConnecting(false);
      return walletAddress;
    } catch (err: any) {
      console.error("FULL WALLET ERROR", err);
      const errorMessage = err?.message || String(err) || 'Wallet connection failed.';
      setError(errorMessage);
      setConnecting(false);
      return '';
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setConnected(false);
    setUserProfile(null);
    localStorage.removeItem('stellar_trust_wallet_address');
  };

  // Profile functions
  const registerProfile = async (username: string, bio: string, skills: string[], role: 'client' | 'freelancer' | 'both') => {
    if (!address) throw new Error('Wallet not connected');
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    
    // Call contract register_user() simulation or network call
    const profile = {
      id: address,
      username,
      bio,
      skills,
      role,
      verified: false
    };

    mockDb.upsertProfile(profile);
    refreshProfile(address);
    mockDb.addActivityLog(address, 'register_profile', `Registered user profile for @${username}`);
    
    trackEvent({
      wallet_address: address || "",
      event_type: 'profile_created',
      metadata: { username, role }
    });

    return profile;
  };

  const verifyProfile = async (wallet: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    const profile = mockDb.getProfile(wallet);
    if (profile) {
      profile.verified = true;
      mockDb.upsertProfile(profile);
      if (address) {
        mockDb.addActivityLog(address, 'verify_profile', `Verified user profile for ${wallet}`);
      }
      if (wallet === address) {
        refreshProfile(wallet);
      }
      return profile;
    }
    throw new Error('Profile not found');
  };

  // Escrow functions
  const createAgreement = async (
    title: string,
    desc: string,
    freelancer: string,
    amount: number,
    milestoneCount: number,
    deadlineDays: number
  ) => {
    if (!address) throw new Error('Wallet not connected');
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + deadlineDays);

    const agreement = {
      title,
      description: desc,
      client_address: address,
      freelancer_address: freelancer,
      amount,
      token_address: 'CDLZFC3SYJYDZT7KMGV55XX2XZPP2D4EE3CYC5EFO7ISXYCLAT234TRZ', // XLM Native
      milestone_count: milestoneCount,
      deadline: deadline.toISOString(),
    };

    const newAgreement = mockDb.createAgreement(agreement);
    
    trackEvent({
      wallet_address: address || "",
      event_type: 'escrow_created',
      metadata: { agreement_id: newAgreement.id, amount, title }
    });

    return newAgreement;
  };

  const fundEscrow = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    const agreement = mockDb.updateAgreementStatus(agreementId, 'Funded', '0x' + Math.random().toString(16).substring(2, 18) + 'txhash');
    
    trackEvent({
      wallet_address: address || "",
      event_type: 'escrow_funded',
      metadata: { agreement_id: agreementId }
    });

    return agreement;
  };

  const acceptAgreement = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    return mockDb.updateAgreementStatus(agreementId, 'Accepted');
  };

  const submitWork = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    const agreement = mockDb.getAgreement(agreementId);
    if (!agreement) throw new Error('Agreement not found');

    const updated = mockDb.updateAgreementStatus(agreementId, 'Submitted');
    
    // Automatically flag first pending milestone as submitted
    const milestones = mockDb.getAgreementMilestones(agreementId);
    const pending = milestones.find((m: any) => m.status === 'Pending');
    if (pending) {
      mockDb.updateMilestoneStatus(pending.id, 'Submitted');
    }

    return updated;
  };

  const approveWork = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    const updated = mockDb.updateAgreementStatus(agreementId, 'Approved');
    
    const milestones = mockDb.getAgreementMilestones(agreementId);
    const submitted = milestones.find((m: any) => m.status === 'Submitted' || m.status === 'Pending');
    if (submitted) {
      mockDb.updateMilestoneStatus(submitted.id, 'Completed');
    }

    return updated;
  };

  const releasePayment = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    const agreement = mockDb.getAgreement(agreementId);
    if (!agreement) throw new Error('Agreement not found');

    // Update milestones to 'Released'
    const milestones = mockDb.getAgreementMilestones(agreementId);
    const completed = milestones.find((m: any) => m.status === 'Completed' || m.status === 'Submitted' || m.status === 'Pending');
    if (completed) {
      mockDb.updateMilestoneStatus(completed.id, 'Released');
    }

    // Check if all are released
    const allMilestones = mockDb.getAgreementMilestones(agreementId);
    const allReleased = allMilestones.every((m: any) => m.status === 'Released');
    
    const status = allReleased ? 'Released' : 'Accepted'; // if more milestones remain, go back to Accepted
    const updated = mockDb.updateAgreementStatus(agreementId, status);

    trackEvent({
      wallet_address: address || "",
      event_type: 'milestone_completed',
      metadata: { agreement_id: agreementId, all_released: allReleased, current_status: status }
    });

    return updated;
  };

  const raiseDispute = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    return mockDb.updateAgreementStatus(agreementId, 'Disputed');
  };

  const refundClient = async (agreementId: string) => {
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    return mockDb.updateAgreementStatus(agreementId, 'Cancelled');
  };

  // Reviews
  const submitReview = async (agreementId: string, rating: number, comment: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }
    const agreement = mockDb.getAgreement(agreementId);
    if (!agreement) throw new Error('Agreement not found');

    const targetAddress = address === agreement.client_address ? agreement.freelancer_address : agreement.client_address;
    if (!targetAddress) throw new Error('No target reviewee address found');

    const review = {
      agreement_id: agreementId,
      author_address: address,
      target_address: targetAddress,
      rating,
      comment
    };

    const newReview = mockDb.addReview(review);

    trackEvent({
      wallet_address: address || "",
      event_type: 'reputation_updated',
      metadata: { agreement_id: agreementId, rating, target: targetAddress }
    });

    return newReview;
  };

  // NFT Certificates
  const mintNFT = async (agreementId: string, freelancer: string, projectName: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!isDemo) {
      throw new Error("On-chain transaction signing & execution is not implemented in the current frontend. Please enable Demo Mode in the header to run mock-blockchain simulations.");
    }

    // Store NFT record in localStorage as a virtual NFT asset
    const nftKey = `stellar_trust_nft_${freelancer}`;
    const existing = localStorage.getItem(nftKey);
    const nfts = existing ? JSON.parse(existing) : [];

    const nft = {
      id: nfts.length + 1,
      agreement_id: agreementId,
      freelancer,
      project_name: projectName,
      project_hash: 'SHA256-' + Math.random().toString(36).substring(2, 15).toUpperCase(),
      completion_date: new Date().toISOString()
    };

    nfts.push(nft);
    localStorage.setItem(nftKey, JSON.stringify(nfts));

    // Log Activity
    mockDb.addActivityLog(freelancer, 'nft_minted', `Minted completion badge NFT for "${projectName}"`);
    mockDb.addNotification(freelancer, `Achievement NFT Minted for "${projectName}"! Check your NFT Gallery.`);

    trackEvent({
      wallet_address: freelancer,
      event_type: 'nft_minted',
      metadata: { agreement_id: agreementId, project_name: projectName }
    });

    return nft;
  };

  return (
    <StellarContext.Provider
      value={{
        address,
        connecting,
        connected,
        error,
        isDemo,
        userProfile,
        connectWallet,
        disconnectWallet,
        toggleDemo,
        refreshProfile,
        registerProfile,
        verifyProfile,
        createAgreement,
        fundEscrow,
        acceptAgreement,
        submitWork,
        approveWork,
        releasePayment,
        raiseDispute,
        refundClient,
        submitReview,
        mintNFT,
      }}
    >
      {children}
    </StellarContext.Provider>
  );
};

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) {
    throw new Error('useStellar must be used within a StellarProvider');
  }
  return context;
};
