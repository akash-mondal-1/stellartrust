-- Add UPDATE policy for feedbacks table (so scripts can update it)
CREATE POLICY IF NOT EXISTS "Allow public update on feedbacks" ON feedbacks FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Fix the names for the 3 previous Google Form feedbacks
UPDATE feedbacks SET 
    name = 'Bekir Erdem', 
    email = 'bekirerdem@example.com', 
    feature_request = 'Simpler onboarding flow' 
WHERE id = 'fb_real_0';

UPDATE feedbacks SET 
    name = 'Madhav', 
    email = 'madhav@example.com', 
    feature_request = 'Open job listings visible to all freelancers' 
WHERE id = 'fb_real_1';

UPDATE feedbacks SET 
    name = 'Hüseyin Taşkın', 
    email = 'huseyintaskin@example.com', 
    feature_request = '' 
WHERE id = 'fb_real_2';
