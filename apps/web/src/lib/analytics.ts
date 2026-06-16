import { posthog } from './posthog';
import { supabase, mockDb } from './supabase';

export interface ValidationEvent {
  wallet_address: string;
  event_type: 'wallet_connected' | 'profile_created' | 'escrow_created' | 'escrow_funded' | 'milestone_completed' | 'reputation_updated' | 'nft_minted';
  metadata?: Record<string, any>;
}

export const trackEvent = async (event: ValidationEvent) => {
  const { wallet_address, event_type, metadata = {} } = event;

  // Retrieve or generate a session ID
  let sessionId = 'session_default_id';
  if (typeof window !== 'undefined') {
    let stored = sessionStorage.getItem('stellar_trust_session_id');
    if (!stored) {
      stored = 'sess_' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('stellar_trust_session_id', stored);
    }
    sessionId = stored;
  }

  const logData = {
    wallet_address,
    event_type,
    session_id: sessionId,
    metadata,
    created_at: new Date().toISOString()
  };

  console.log(`[Analytics Event Logger] [${event_type}]`, logData);

  // 1. Capture via PostHog
  try {
    posthog.capture(event_type, {
      distinct_id: wallet_address,
      session_id: sessionId,
      ...metadata
    });
  } catch (err) {
    console.warn('PostHog capture skipped/failed:', err);
  }

  // 2. Sync to Supabase Database (or local storage fallback)
  try {
    const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('stellartrust.supabase.co') || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (isMock) {
      // Local fallback sync
      mockDb.addValidationEvent({
        wallet_address,
        event_type,
        metadata
      });
    } else {
      // Production database write
      const { error } = await supabase
        .from('validation_events')
        .insert({
          wallet_address,
          event_type,
          session_id: sessionId,
          metadata
        });
      
      if (error) throw error;
    }
  } catch (err) {
    console.error('Failed to sync validation event to DB:', err);
    // Silent fallback to mockDb to ensure experience never crashes
    mockDb.addValidationEvent({
      wallet_address,
      event_type,
      metadata
    });
  }
};
