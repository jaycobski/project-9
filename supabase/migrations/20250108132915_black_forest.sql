-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_submission_trigger ON email_submissions CASCADE;
DROP FUNCTION IF EXISTS validate_submission CASCADE;
DROP FUNCTION IF EXISTS is_valid_email CASCADE;

-- Recreate the table with a clean slate
DROP TABLE IF EXISTS email_submissions CASCADE;
CREATE TABLE email_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  survey_data jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Create simple policy for public access
CREATE POLICY "enable_public_access"
  ON email_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);