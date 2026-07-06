-- supabase_fix.sql
-- Run this ENTIRE script in Supabase SQL Editor to fix your tables.
-- It drops and recreates the tables with TEXT primary keys.
-- ⚠️  This will DELETE existing data in those tables (which is empty anyway since seeding failed).

-- Drop existing tables
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS onboardings CASCADE;
DROP TABLE IF EXISTS validation_events CASCADE;

-- Recreate with TEXT primary keys
CREATE TABLE validation_events (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    event_type TEXT NOT NULL,
    session_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE onboardings (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_interaction TEXT,
    referred_by TEXT,
    connection_source TEXT,
    escrow_count INTEGER DEFAULT 0,
    nft_count INTEGER DEFAULT 0
);

CREATE TABLE feedbacks (
    id TEXT PRIMARY KEY,
    user_address TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE validation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Allow public read & write (MVP mode)
CREATE POLICY "Allow public insert on validation_events" ON validation_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read on validation_events" ON validation_events FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert on onboardings" ON onboardings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read on onboardings" ON onboardings FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on onboardings" ON onboardings FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert on feedbacks" ON feedbacks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read on feedbacks" ON feedbacks FOR SELECT TO public USING (true);
