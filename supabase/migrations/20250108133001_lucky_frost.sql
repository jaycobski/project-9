-- Drop everything related to submissions
DROP TABLE IF EXISTS email_submissions CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;

-- Create a simple submissions table
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  survey_data jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS with simple policy
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all"
  ON submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);