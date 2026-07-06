-- Add missing columns to feedbacks table
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS feature_request TEXT DEFAULT '';

-- Verify columns were added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'feedbacks' ORDER BY ordinal_position;
