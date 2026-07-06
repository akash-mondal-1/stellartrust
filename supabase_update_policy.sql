-- Add update policy for feedbacks
CREATE POLICY IF NOT EXISTS "Allow public update on feedbacks" ON feedbacks FOR UPDATE TO public USING (true) WITH CHECK (true);
