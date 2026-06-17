import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stellartrust.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Real Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage-backed mock database for local development fallback
class MockDatabase {
  public getStorage(key: string, defaultValue: any[]): any[] {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(`stellar_trust_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  }

  public setStorage(key: string, data: any[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`stellar_trust_${key}`, JSON.stringify(data));
  }

  // Profiles operations
  getProfiles() {
    return this.getStorage('profiles', []);
  }

  getProfile(wallet: string) {
    return this.getProfiles().find((p: any) => p.id === wallet) || null;
  }

  upsertProfile(profile: any) {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p: any) => p.id === profile.id);
    const updated = {
      ...profile,
      rating: profile.rating ?? (profiles[index]?.rating ?? 0.0),
      trust_score: profile.trust_score ?? (profiles[index]?.trust_score ?? 50),
      verified: profile.verified ?? (profiles[index]?.verified ?? false),
      updated_at: new Date().toISOString()
    };

    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updated };
    } else {
      profiles.push({
        ...updated,
        created_at: new Date().toISOString()
      });
    }
    this.setStorage('profiles', profiles);
    return updated;
  }

  // Agreements operations
  getAgreements() {
    return this.getStorage('agreements', []);
  }

  getAgreement(id: string) {
    return this.getAgreements().find((a: any) => a.id === id) || null;
  }

  createAgreement(agreement: any) {
    const agreements = this.getAgreements();
    const newAgreement = {
      id: Math.random().toString(36).substring(2, 11),
      ...agreement,
      status: 'Created',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    agreements.push(newAgreement);
    this.setStorage('agreements', agreements);

    // Create milestones automatically
    const milestones = this.getMilestones();
    const count = parseInt(agreement.milestone_count) || 1;
    const amount = parseFloat(agreement.amount) / count;
    for (let i = 0; i < count; i++) {
      milestones.push({
        id: Math.random().toString(36).substring(2, 11),
        agreement_id: newAgreement.id,
        title: `Milestone ${i + 1}: Progress Review`,
        amount: parseFloat(amount.toFixed(2)),
        status: 'Pending',
        created_at: new Date().toISOString()
      });
    }
    this.setStorage('milestones', milestones);

    // Add activity log
    this.addActivityLog(
      agreement.client_address,
      'create_project',
      `Created work agreement "${agreement.title}" for ${agreement.amount} XLM`
    );

    this.addNotification(
      agreement.client_address,
      `Agreement "${agreement.title}" created. Please fund the escrow.`
    );
    if (agreement.freelancer_address) {
      this.addNotification(
        agreement.freelancer_address,
        `You have been invited to join the project "${agreement.title}".`
      );
    }

    return newAgreement;
  }

  updateAgreementStatus(id: string, status: string, txHash?: string) {
    const agreements = this.getAgreements();
    const index = agreements.findIndex((a: any) => a.id === id);
    if (index >= 0) {
      agreements[index].status = status;
      if (txHash) agreements[index].tx_hash = txHash;
      agreements[index].updated_at = new Date().toISOString();
      this.setStorage('agreements', agreements);

      const agreement = agreements[index];
      // Log activity
      this.addActivityLog(
        status === 'Funded' ? agreement.client_address : agreement.freelancer_address || 'system',
        `status_${status.toLowerCase()}`,
        `Agreement "${agreement.title}" status updated to ${status}`,
        txHash
      );

      // Create notifications
      this.addNotification(agreement.client_address, `Project "${agreement.title}" is now ${status}.`);
      if (agreement.freelancer_address) {
        this.addNotification(agreement.freelancer_address, `Project "${agreement.title}" is now ${status}.`);
      }

      return agreements[index];
    }
    return null;
  }

  // Milestones operations
  getMilestones() {
    return this.getStorage('milestones', []);
  }

  getAgreementMilestones(agreementId: string) {
    return this.getMilestones().filter((m: any) => m.agreement_id === agreementId);
  }

  updateMilestoneStatus(milestoneId: string, status: string) {
    const milestones = this.getMilestones();
    const index = milestones.findIndex((m: any) => m.id === milestoneId);
    if (index >= 0) {
      milestones[index].status = status;
      this.setStorage('milestones', milestones);
      return milestones[index];
    }
    return null;
  }

  // Reviews operations
  getReviews() {
    return this.getStorage('reviews', []);
  }

  addReview(review: any) {
    const reviews = this.getReviews();
    const newReview = {
      id: Math.random().toString(36).substring(2, 11),
      ...review,
      created_at: new Date().toISOString()
    };
    reviews.push(newReview);
    this.setStorage('reviews', reviews);

    // Update profile scores
    const profiles = this.getProfiles();
    const targetProfile = profiles.find((p: any) => p.id === review.target_address);
    if (targetProfile) {
      const targetReviews = reviews.filter((r: any) => r.target_address === review.target_address);
      const sum = targetReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      targetProfile.rating = parseFloat((sum / targetReviews.length).toFixed(2));
      
      // Calculate trust score
      const completedCount = targetReviews.length;
      let score = 50 + (completedCount * 2) + Math.round(targetProfile.rating * 5);
      if (score > 100) score = 100;
      targetProfile.trust_score = score;
      
      this.upsertProfile(targetProfile);
    }

    return newReview;
  }

  // Notifications
  getNotifications(wallet: string) {
    return this.getStorage('notifications', []).filter((n: any) => n.user_address === wallet);
  }

  addNotification(wallet: string, message: string) {
    const notifications = this.getStorage('notifications', []);
    notifications.push({
      id: Math.random().toString(36).substring(2, 11),
      user_address: wallet,
      message,
      read: false,
      created_at: new Date().toISOString()
    });
    this.setStorage('notifications', notifications);
  }

  markNotificationsRead(wallet: string) {
    const notifications = this.getStorage('notifications', []);
    notifications.forEach((n: any) => {
      if (n.user_address === wallet) n.read = true;
    });
    this.setStorage('notifications', notifications);
  }

  // Activity logs
  getActivityLogs() {
    return this.getStorage('activity_logs', []);
  }

  addActivityLog(wallet: string, action_type: string, description: string, tx_hash?: string) {
    const logs = this.getActivityLogs();
    logs.push({
      id: Math.random().toString(36).substring(2, 11),
      user_address: wallet,
      action_type,
      description,
      tx_hash,
      created_at: new Date().toISOString()
    });
    this.setStorage('activity_logs', logs);
  }

  // Feedback validation
  getFeedback() {
    return this.getStorage('feedback', []);
  }

  addFeedback(feedback: any) {
    const feedbacks = this.getFeedback();
    const newFeedback = {
      id: Math.random().toString(36).substring(2, 11),
      ...feedback,
      created_at: new Date().toISOString()
    };
    feedbacks.push(newFeedback);
    this.setStorage('feedback', feedbacks);
    return newFeedback;
  }

  // Validation events operations for Green Belt analytics
  getValidationEvents() {
    return this.getStorage('validation_events', []);
  }

  addValidationEvent(event: any) {
    const events = this.getValidationEvents();
    
    // Retrieve or generate a session ID
    let sessionId = 'session_mock_default_id';
    if (typeof window !== 'undefined') {
      let stored = sessionStorage.getItem('stellar_trust_session_id');
      if (!stored) {
        stored = 'sess_' + Math.random().toString(36).substring(2, 12);
        sessionStorage.setItem('stellar_trust_session_id', stored);
      }
      sessionId = stored;
    }

    const newEvent = {
      id: Math.random().toString(36).substring(2, 11),
      wallet_address: event.wallet_address,
      event_type: event.event_type,
      session_id: sessionId,
      metadata: event.metadata || {},
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    this.setStorage('validation_events', events);
    return newEvent;
  }
}

export const mockDb = new MockDatabase();
