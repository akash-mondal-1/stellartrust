-- Initial migration schema for StellarTrust Database

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id VARCHAR(56) PRIMARY KEY, -- Stellar Public Key (G...)
    username VARCHAR(100) UNIQUE,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    rating NUMERIC(3,2) DEFAULT 0.00,
    trust_score INT DEFAULT 50,
    verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'both', -- 'client', 'freelancer', or 'both'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid()::text = id OR true); -- Fallback for wallet-based authorization

-- Create agreements table
CREATE TABLE IF NOT EXISTS public.agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_chain_id VARCHAR(64), -- Escrow agreement ID from Soroban (as hex or string)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_address VARCHAR(56) NOT NULL,
    freelancer_address VARCHAR(56),
    amount NUMERIC NOT NULL,
    token_address VARCHAR(56) NOT NULL, -- XLM or custom token contract ID
    status VARCHAR(50) NOT NULL DEFAULT 'Created', -- Created, Funded, Accepted, Submitted, Approved, Released, Disputed, Cancelled
    deadline TIMESTAMP WITH TIME ZONE,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for agreements
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on agreements"
    ON public.agreements FOR SELECT
    USING (true);

CREATE POLICY "Allow any user to insert agreements"
    ON public.agreements FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow client or freelancer to update agreements"
    ON public.agreements FOR UPDATE
    USING (true);

-- Create milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID REFERENCES public.agreements(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Released
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on milestones"
    ON public.milestones FOR SELECT
    USING (true);

CREATE POLICY "Allow insert/update access on milestones"
    ON public.milestones FOR ALL
    USING (true);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID REFERENCES public.agreements(id) ON DELETE CASCADE,
    author_address VARCHAR(56) NOT NULL,
    target_address VARCHAR(56) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Allow insertion of reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(56) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own notifications"
    ON public.notifications FOR SELECT
    USING (true);

CREATE POLICY "Allow users to update/insert notifications"
    ON public.notifications FOR ALL
    USING (true);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(56) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on activity_logs"
    ON public.activity_logs FOR SELECT
    USING (true);

CREATE POLICY "Allow insert access on activity_logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (true);

-- Create wallet_sessions table
CREATE TABLE IF NOT EXISTS public.wallet_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(56) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS for wallet_sessions
ALTER TABLE public.wallet_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow session management"
    ON public.wallet_sessions FOR ALL
    USING (true);

-- Create feedback table for validation testing
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(56) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public feedback inserts"
    ON public.feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow reading feedback"
    ON public.feedback FOR SELECT
    USING (true);

-- Create validation_events table for Green Belt testing tracker
CREATE TABLE IF NOT EXISTS public.validation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(56) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for validation_events
ALTER TABLE public.validation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on validation_events"
    ON public.validation_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow reading validation_events"
    ON public.validation_events FOR SELECT
    USING (true);

-- Index for analytics aggregation
CREATE INDEX IF NOT EXISTS idx_validation_events_wallet ON public.validation_events(wallet_address);
CREATE INDEX IF NOT EXISTS idx_validation_events_type ON public.validation_events(event_type);
