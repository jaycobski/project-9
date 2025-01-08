-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_submission_created ON submissions;
DROP FUNCTION IF EXISTS handle_new_submission();

-- Recreate submissions table with a clean slate
DROP TABLE IF EXISTS submissions CASCADE;

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  survey_data jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create simple policy for public access
CREATE POLICY "enable_public_access"
  ON submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);