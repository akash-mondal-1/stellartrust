-- supabase_setup.sql
-- Run this script in your Supabase SQL Editor to create the required tables for tracking

CREATE TABLE IF NOT EXISTS validation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    event_type TEXT NOT NULL,
    session_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboardings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL UNIQUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_interaction TEXT,
    referred_by TEXT,
    connection_source TEXT,
    escrow_count INTEGER DEFAULT 0,
    nft_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended, currently set to allow all for easy integration)
ALTER TABLE validation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public inserts and reads (for demonstration/MVP purposes)
CREATE POLICY "Allow public insert on validation_events" ON validation_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read on validation_events" ON validation_events FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert on onboardings" ON onboardings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read on onboardings" ON onboardings FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on onboardings" ON onboardings FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert on feedbacks" ON feedbacks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read on feedbacks" ON feedbacks FOR SELECT TO public USING (true);
