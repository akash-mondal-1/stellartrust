'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { mockDb } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { 
  queryContract, 
  submitTransaction, 
  validateAddress,
  nativeToScVal, 
  scValToNative, 
  ScInt, 
  Address,
  IDENTITY_CONTRACT,
  ESCROW_CONTRACT,
  REPUTATION_CONTRACT,
  NFT_CONTRACT,
  XLM_TOKEN_CONTRACT,
  getAgreement,
  getBlockchainEvents
} from '@/lib/stellar';

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
  syncAgreement: (agreementId: string) => Promise<any>;
}

const StellarContext = createContext<StellarContextType | null>(null);

export const StellarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [userProfile, setUserProfile] = useState<UserSession | null>(null);

  // Auto-load connected address or demo address
  useEffect(() => {
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

  const refreshProfile = async (walletAddr: string) => {
    try {
      // 1. Fetch profile metadata from Identity contract
      const walletScVal = new Address(walletAddr).toScVal();
      const profileData = await queryContract(IDENTITY_CONTRACT, 'get_profile', [walletScVal]);

      // 2. Fetch reputation statistics from Reputation contract
      const reputationData = await queryContract(REPUTATION_CONTRACT, 'get_reputation', [walletScVal]);

      let updatedProfile: UserSession = { address: walletAddr };

      if (profileData) {
        updatedProfile = {
          address: walletAddr,
          username: profileData.username,
          bio: profileData.bio,
          skills: profileData.skills,
          verified: profileData.verified,
          trust_score: reputationData ? reputationData.trust_score : 50,
          rating: reputationData && reputationData.rating_count > 0 
            ? Number((reputationData.rating_sum / reputationData.rating_count).toFixed(2)) 
            : 0.0,
        };

        // Sync with mockDb so other pages/components querying mockDb remain updated
        mockDb.upsertProfile({
          id: walletAddr,
          username: updatedProfile.username || '',
          bio: updatedProfile.bio || '',
          skills: updatedProfile.skills || [],
          role: 'both',
          verified: updatedProfile.verified || false,
          trust_score: updatedProfile.trust_score || 50,
          rating: updatedProfile.rating || 0.0
        });
      } else {
        // Fallback to local storage if not registered on-chain yet
        const localProf = mockDb.getProfile(walletAddr);
        if (localProf) {
          updatedProfile = localProf as UserSession;
        }
      }

      setUserProfile(updatedProfile);

      // 3. Sync all user agreements with on-chain states in live mode
      if (!isDemo) {
        try {
          const userAgs = mockDb.getAgreements().filter(
            a => a.client_address?.toLowerCase() === walletAddr.toLowerCase() ||
                 a.freelancer_address?.toLowerCase() === walletAddr.toLowerCase()
          );
          for (const ag of userAgs) {
            await syncAgreement(ag.id);
          }
        } catch (syncErr) {
          console.warn("Failed to sync agreements on profile refresh:", syncErr);
        }
      }
    } catch (e) {
      console.error('Failed to refresh profile from blockchain:', e);
      const fallback = mockDb.getProfile(walletAddr);
      if (fallback) {
        setUserProfile(fallback as UserSession);
      } else {
        setUserProfile({ address: walletAddr });
      }
    }
  };

  const syncAgreement = async (agreementId: string) => {
    if (isDemo) return mockDb.getAgreement(agreementId);
    try {
      console.log(`Syncing agreement ${agreementId} status with on-chain contract...`);
      const chainAg = await getAgreement(agreementId);
      if (!chainAg) return mockDb.getAgreement(agreementId);

      let localAg = mockDb.getAgreement(agreementId);
      if (!localAg) {
        console.log(`Agreement ${agreementId} not found in local cache. Fetching from chain...`);
        const agreements = mockDb.getAgreements();
        const baseAg = {
          id: agreementId,
          title: `On-Chain Agreement #${agreementId}`,
          description: `Work agreement dynamically synchronized from the Soroban escrow contract.`,
          client_address: chainAg.client_address,
          freelancer_address: chainAg.freelancer_address,
          amount: chainAg.amount,
          token_address: chainAg.token_address,
          milestone_count: chainAg.milestone_count,
          deadline: chainAg.deadline,
          status: chainAg.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        agreements.push(baseAg);
        mockDb.setStorage('agreements', agreements);

        // Populate milestones
        const milestones = mockDb.getMilestones();
        const count = chainAg.milestone_count;
        const amt = chainAg.amount / count;
        for (let i = 0; i < count; i++) {
          milestones.push({
            id: `chain_m_${agreementId}_${i}`,
            agreement_id: agreementId,
            title: `Milestone ${i + 1}: Progress Review`,
            amount: parseFloat(amt.toFixed(2)),
            status: i < chainAg.current_milestone ? 'Released' : 'Pending',
            created_at: new Date().toISOString()
          });
        }
        mockDb.setStorage('milestones', milestones);
        localAg = baseAg;
      }

      // Sync status
      if (localAg.status !== chainAg.status) {
        mockDb.updateAgreementStatus(agreementId, chainAg.status);
      }

      // Sync milestones
      const milestones = mockDb.getAgreementMilestones(agreementId);
      milestones.forEach((m: any, idx: number) => {
        let newStatus = 'Pending';
        if (idx < chainAg.current_milestone) {
          newStatus = 'Released';
        } else if (idx === chainAg.current_milestone) {
          if (chainAg.status === 'Submitted') {
            newStatus = 'Submitted';
          } else if (chainAg.status === 'Approved') {
            newStatus = 'Completed';
          }
        }
        if (m.status !== newStatus) {
          mockDb.updateMilestoneStatus(m.id, newStatus);
        }
      });

      return mockDb.getAgreement(agreementId);
    } catch (err) {
      console.error(`Failed to sync agreement ${agreementId}:`, err);
      return mockDb.getAgreement(agreementId);
    }
  };

  const connectWallet = async (type: WalletType): Promise<string> => {
    setConnecting(true);
    setError(null);
    // Clear any stale demo address so real wallet can connect fresh
    localStorage.removeItem('stellar_trust_wallet_address');
    localStorage.removeItem('stellar_trust_demo_mode');
    try {
      console.log("STEP 1: Checking Freighter extension presence");
      const { isConnected, requestAccess, getAddress } = require('@stellar/freighter-api');

      const connStatus = await isConnected();
      console.log("STEP 1: isConnected result =", connStatus);

      const extensionInstalled = typeof window !== 'undefined' && !!(window as any).freighter;
      console.log("STEP 1: window.freighter present =", extensionInstalled);

      if (!extensionInstalled && !connStatus?.isConnected) {
        throw new Error(
          "Freighter extension not detected. Please install Freighter from freighter.app and refresh."
        );
      }

      console.log("STEP 2: Calling requestAccess() — popup will appear now");
      const accessResult = await requestAccess();
      console.log("STEP 2: requestAccess result =", accessResult);

      if (accessResult?.error) {
        throw new Error(`Access denied: ${accessResult.error}`);
      }

      let walletAddress: string = accessResult?.address || '';

      if (!walletAddress) {
        console.log("STEP 3: requestAccess returned no address, calling getAddress()");
        const addrResult = await getAddress();
        console.log("STEP 3: getAddress result =", addrResult);
        if (addrResult?.error) {
          throw new Error(`Failed to get address: ${addrResult.error}`);
        }
        walletAddress = addrResult?.address || '';
      }

      if (!walletAddress) {
        throw new Error("No address returned. User may have rejected the connection request.");
      }

      console.log("STEP 4: Connection successful. Address =", walletAddress);
      setIsDemo(false);
      setAddress(walletAddress);
      setConnected(true);
      localStorage.setItem('stellar_trust_wallet_address', walletAddress);
      localStorage.setItem('stellar_trust_demo_mode', 'false');
      
      await refreshProfile(walletAddress);

      trackEvent({
        wallet_address: walletAddress,
        event_type: 'wallet_connected',
        metadata: { wallet_type: type, mode: 'live' }
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
  const registerProfile = async (
    username: string, 
    bio: string, 
    skills: string[], 
    role: 'client' | 'freelancer' | 'both'
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    if (isDemo) {
      const profile = { id: address, username, bio, skills, role, verified: false };
      mockDb.upsertProfile(profile);
      await refreshProfile(address);
      mockDb.addActivityLog(address, 'register_profile', `Registered user profile for @${username}`);
      return profile;
    }

    const walletScVal = new Address(address).toScVal();
    const usernameScVal = nativeToScVal(username);
    const bioScVal = nativeToScVal(bio);
    const skillsScVal = nativeToScVal(skills);

    // Check if user is already registered to choose register or update method
    const existing = await queryContract(IDENTITY_CONTRACT, 'get_profile', [walletScVal]);
    const method = existing ? 'update_profile' : 'register_user';

    console.log(`Executing ${method} on-chain for profile @${username}...`);
    const { txHash, result } = await submitTransaction(
      address,
      IDENTITY_CONTRACT,
      method,
      [walletScVal, usernameScVal, bioScVal, skillsScVal]
    );

    await refreshProfile(address);
    mockDb.addActivityLog(address, 'register_profile', `Registered user profile for @${username}`, txHash);
    
    trackEvent({
      wallet_address: address,
      event_type: 'profile_created',
      metadata: { username, role, tx_hash: txHash }
    });

    return result;
  };

  const verifyProfile = async (wallet: string) => {
    if (isDemo) {
      const profile = mockDb.getProfile(wallet);
      if (profile) {
        profile.verified = true;
        mockDb.upsertProfile(profile);
        if (address) {
          mockDb.addActivityLog(address, 'verify_profile', `Verified user profile for ${wallet}`);
        }
        if (wallet === address) {
          await refreshProfile(wallet);
        }
        return profile;
      }
      throw new Error('Profile not found');
    }

    console.log(`Triggering admin identity verification endpoint for ${wallet}...`);
    const res = await fetch('/api/verify-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Identity verification failed');
    }

    await refreshProfile(wallet);
    if (address) {
      mockDb.addActivityLog(address, 'verify_profile', `Verified user profile for ${wallet}`, data.txHash);
    }
    return data;
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

    if (isDemo) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + deadlineDays);
      const agreement = {
        title,
        description: desc,
        client_address: address,
        freelancer_address: freelancer,
        amount,
        token_address: XLM_TOKEN_CONTRACT,
        milestone_count: milestoneCount,
        deadline: deadline.toISOString(),
      };
      return mockDb.createAgreement(agreement);
    }

    validateAddress(freelancer);

    const clientScVal = new Address(address).toScVal();
    const freelancerScVal = new Address(freelancer).toScVal();
    
    // Scale amount to Stroops (1 XLM = 10^7 Stroops)
    const stroops = BigInt(Math.round(amount * 10000000));
    const amountScVal = new ScInt(stroops).toI128();
    
    const tokenScVal = new Address(XLM_TOKEN_CONTRACT).toScVal();
    
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);
    const deadlineSeconds = BigInt(Math.floor(deadlineDate.getTime() / 1000));
    const deadlineScVal = nativeToScVal(deadlineSeconds);
    
    const milestoneCountScVal = nativeToScVal(milestoneCount); // converts to scvU64/u32 representation

    console.log("Creating escrow agreement on-chain...");
    const { txHash, result: agreementId } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'create_agreement',
      [
        clientScVal,
        freelancerScVal,
        amountScVal,
        tokenScVal,
        deadlineScVal,
        milestoneCountScVal
      ]
    );

    console.log(`Agreement created successfully. ID: ${agreementId}, Tx Hash: ${txHash}`);

    // Store in local storage using the real contract's generated u32 ID
    const agreement = {
      id: agreementId.toString(),
      title,
      description: desc,
      client_address: address,
      freelancer_address: freelancer,
      amount,
      token_address: XLM_TOKEN_CONTRACT,
      milestone_count: milestoneCount,
      deadline: deadlineDate.toISOString(),
      tx_hash: txHash,
    };

    const newAgreement = mockDb.createAgreement(agreement);

    // Sync IDs in local storage mockDb
    const agreements = mockDb.getAgreements();
    const idx = agreements.findIndex(a => a.id === newAgreement.id);
    if (idx >= 0) {
      agreements[idx].id = agreementId.toString();
      mockDb.setStorage('agreements', agreements);
    }

    const milestones = mockDb.getMilestones();
    milestones.forEach(m => {
      if (m.agreement_id === newAgreement.id) {
        m.agreement_id = agreementId.toString();
      }
    });
    mockDb.setStorage('milestones', milestones);
    
    trackEvent({
      wallet_address: address,
      event_type: 'escrow_created',
      metadata: { agreement_id: agreementId.toString(), amount, title, tx_hash: txHash }
    });

    return { ...newAgreement, id: agreementId.toString() };
  };

  const fundEscrow = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      const agreement = mockDb.updateAgreementStatus(agreementId, 'Funded', '0x' + Math.random().toString(16).substring(2, 18) + 'txhash');
      trackEvent({
        wallet_address: address,
        event_type: 'escrow_funded',
        metadata: { agreement_id: agreementId }
      });
      return agreement;
    }

    const agreementIdNum = parseInt(agreementId);
    if (isNaN(agreementIdNum)) {
      throw new Error(`Invalid agreement ID: ${agreementId}`);
    }

    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const clientScVal = new Address(address).toScVal();

    console.log(`Funding escrow on-chain for agreement ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'fund_escrow',
      [agreementIdScVal, clientScVal]
    );

    const agreement = mockDb.updateAgreementStatus(agreementId, 'Funded', txHash);
    
    trackEvent({
      wallet_address: address,
      event_type: 'escrow_funded',
      metadata: { agreement_id: agreementId, tx_hash: txHash }
    });

    return agreement;
  };

  const acceptAgreement = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      return mockDb.updateAgreementStatus(agreementId, 'Accepted');
    }

    const agreementIdNum = parseInt(agreementId);
    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const freelancerScVal = new Address(address).toScVal();

    console.log(`Accepting agreement on-chain for ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'accept_agreement',
      [agreementIdScVal, freelancerScVal]
    );

    return mockDb.updateAgreementStatus(agreementId, 'Accepted', txHash);
  };

  const submitWork = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      const updated = mockDb.updateAgreementStatus(agreementId, 'Submitted');
      const milestones = mockDb.getAgreementMilestones(agreementId);
      const pending = milestones.find((m: any) => m.status === 'Pending');
      if (pending) {
        mockDb.updateMilestoneStatus(pending.id, 'Submitted');
      }
      return updated;
    }

    const agreementIdNum = parseInt(agreementId);
    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const freelancerScVal = new Address(address).toScVal();

    console.log(`Submitting milestone work on-chain for ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'submit_work',
      [agreementIdScVal, freelancerScVal]
    );

    const updated = mockDb.updateAgreementStatus(agreementId, 'Submitted', txHash);
    
    const milestones = mockDb.getAgreementMilestones(agreementId);
    const pending = milestones.find((m: any) => m.status === 'Pending');
    if (pending) {
      mockDb.updateMilestoneStatus(pending.id, 'Submitted');
    }

    return updated;
  };

  const approveWork = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      const updated = mockDb.updateAgreementStatus(agreementId, 'Approved');
      const milestones = mockDb.getAgreementMilestones(agreementId);
      const submitted = milestones.find((m: any) => m.status === 'Submitted' || m.status === 'Pending');
      if (submitted) {
        mockDb.updateMilestoneStatus(submitted.id, 'Completed');
      }
      return updated;
    }

    const agreementIdNum = parseInt(agreementId);
    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const clientScVal = new Address(address).toScVal();

    console.log(`Approving milestone work on-chain for ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'approve_work',
      [agreementIdScVal, clientScVal]
    );

    const updated = mockDb.updateAgreementStatus(agreementId, 'Approved', txHash);
    
    const milestones = mockDb.getAgreementMilestones(agreementId);
    const submitted = milestones.find((m: any) => m.status === 'Submitted' || m.status === 'Pending');
    if (submitted) {
      mockDb.updateMilestoneStatus(submitted.id, 'Completed');
    }

    return updated;
  };

  const releasePayment = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      const milestones = mockDb.getAgreementMilestones(agreementId);
      const completed = milestones.find((m: any) => m.status === 'Completed' || m.status === 'Submitted' || m.status === 'Pending');
      if (completed) {
        mockDb.updateMilestoneStatus(completed.id, 'Released');
      }
      const allMilestones = mockDb.getAgreementMilestones(agreementId);
      const allReleased = allMilestones.every((m: any) => m.status === 'Released');
      const status = allReleased ? 'Released' : 'Accepted';
      const updated = mockDb.updateAgreementStatus(agreementId, status);
      return updated;
    }

    const agreementIdNum = parseInt(agreementId);
    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const clientScVal = new Address(address).toScVal();

    console.log(`Releasing milestone payment on-chain for ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'release_payment',
      [agreementIdScVal, clientScVal]
    );

    const milestones = mockDb.getAgreementMilestones(agreementId);
    const completed = milestones.find((m: any) => m.status === 'Completed' || m.status === 'Submitted' || m.status === 'Pending');
    if (completed) {
      mockDb.updateMilestoneStatus(completed.id, 'Released');
    }

    const allMilestones = mockDb.getAgreementMilestones(agreementId);
    const allReleased = allMilestones.every((m: any) => m.status === 'Released');
    
    const status = allReleased ? 'Released' : 'Accepted';
    const updated = mockDb.updateAgreementStatus(agreementId, status, txHash);

    trackEvent({
      wallet_address: address,
      event_type: 'milestone_completed',
      metadata: { agreement_id: agreementId, all_released: allReleased, current_status: status, tx_hash: txHash }
    });

    return updated;
  };

  const raiseDispute = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      return mockDb.updateAgreementStatus(agreementId, 'Disputed');
    }

    const agreementIdNum = parseInt(agreementId);
    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const partyScVal = new Address(address).toScVal();

    console.log(`Raising dispute on-chain for ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'raise_dispute',
      [agreementIdScVal, partyScVal]
    );

    return mockDb.updateAgreementStatus(agreementId, 'Disputed', txHash);
  };

  const refundClient = async (agreementId: string) => {
    if (!address) throw new Error('Wallet not connected');

    if (isDemo) {
      return mockDb.updateAgreementStatus(agreementId, 'Cancelled');
    }

    const agreementIdNum = parseInt(agreementId);
    const agreementIdScVal = nativeToScVal(agreementIdNum);
    const authorityScVal = new Address(address).toScVal();

    console.log(`Executing client refund on-chain for ID: ${agreementIdNum}...`);
    const { txHash } = await submitTransaction(
      address,
      ESCROW_CONTRACT,
      'refund_client',
      [agreementIdScVal, authorityScVal]
    );

    return mockDb.updateAgreementStatus(agreementId, 'Cancelled', txHash);
  };

  // Reviews
  const submitReview = async (agreementId: string, rating: number, comment: string) => {
    if (!address) throw new Error('Wallet not connected');
    const agreement = mockDb.getAgreement(agreementId);
    if (!agreement) throw new Error('Agreement not found');

    const targetAddress = address === agreement.client_address ? agreement.freelancer_address : agreement.client_address;
    if (!targetAddress) throw new Error('No target reviewee address found');

    if (isDemo) {
      const review = {
        agreement_id: agreementId,
        author_address: address,
        target_address: targetAddress,
        rating,
        comment
      };
      const newReview = mockDb.addReview(review);
      return newReview;
    }

    validateAddress(targetAddress);

    // Arguments for Reputation contract
    const agreementIdScVal = nativeToScVal(agreementId); // String representation
    const reviewerScVal = new Address(address).toScVal();
    const revieweeScVal = new Address(targetAddress).toScVal();
    const ratingScVal = nativeToScVal(rating); // converts to scvU64/u32 representation
    const commentScVal = nativeToScVal(comment);

    console.log(`Submitting profile review on Reputation contract for ID: ${agreementId}...`);
    const { txHash } = await submitTransaction(
      address,
      REPUTATION_CONTRACT,
      'add_review',
      [agreementIdScVal, reviewerScVal, revieweeScVal, ratingScVal, commentScVal]
    );

    const review = {
      agreement_id: agreementId,
      author_address: address,
      target_address: targetAddress,
      rating,
      comment,
      tx_hash: txHash
    };

    const newReview = mockDb.addReview(review);

    // Refresh trust scores immediately on-chain
    await refreshProfile(address);
    await refreshProfile(targetAddress);

    trackEvent({
      wallet_address: address,
      event_type: 'reputation_updated',
      metadata: { agreement_id: agreementId, rating, target: targetAddress, tx_hash: txHash }
    });

    return newReview;
  };

  // NFT Certificates
  const mintNFT = async (agreementId: string, freelancer: string, projectName: string) => {
    if (!address) throw new Error('Wallet not connected');

    const projectHash = 'SHA256-' + Math.random().toString(36).substring(2, 15).toUpperCase();

    if (isDemo) {
      const nftKey = `stellar_trust_nft_${freelancer}`;
      const existing = localStorage.getItem(nftKey);
      const nfts = existing ? JSON.parse(existing) : [];

      const nft = {
        id: nfts.length + 1,
        agreement_id: agreementId,
        freelancer,
        project_name: projectName,
        project_hash: projectHash,
        completion_date: new Date().toISOString()
      };

      nfts.push(nft);
      localStorage.setItem(nftKey, JSON.stringify(nfts));

      mockDb.addActivityLog(freelancer, 'nft_minted', `Minted completion badge NFT for "${projectName}"`);
      mockDb.addNotification(freelancer, `Achievement NFT Minted for "${projectName}"! Check your NFT Gallery.`);

      trackEvent({
        wallet_address: freelancer,
        event_type: 'nft_minted',
        metadata: { agreement_id: agreementId, project_name: projectName }
      });

      return nft;
    }

    console.log(`Requesting admin NFT minting endpoint for: ${freelancer}...`);
    const res = await fetch('/api/mint-nft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        freelancer,
        agreementId,
        projectName,
        projectHash
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'NFT minting failed');
    }

    const nftKey = `stellar_trust_nft_${freelancer}`;
    const existing = localStorage.getItem(nftKey);
    const nfts = existing ? JSON.parse(existing) : [];

    const nft = {
      id: data.tokenId || (nfts.length + 1),
      agreement_id: agreementId,
      freelancer,
      project_name: projectName,
      project_hash: projectHash,
      completion_date: new Date().toISOString(),
      tx_hash: data.txHash
    };

    nfts.push(nft);
    localStorage.setItem(nftKey, JSON.stringify(nfts));

    mockDb.addActivityLog(freelancer, 'nft_minted', `Minted completion badge NFT for "${projectName}"`, data.txHash);
    mockDb.addNotification(freelancer, `Achievement NFT Minted for "${projectName}"! Check your NFT Gallery.`);

    trackEvent({
      wallet_address: freelancer,
      event_type: 'nft_minted',
      metadata: { agreement_id: agreementId, project_name: projectName, tx_hash: data.txHash }
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
        syncAgreement,
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

