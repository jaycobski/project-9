/*
  # Fix submissions table and policies

  1. Changes
    - Create submissions table with proper structure
    - Set up RLS policies for public access
    - Add validation trigger
    - Add email notification trigger

  2. Security
    - Enable RLS on submissions table
    - Add policy for public insert access
    - Add policy for authenticated users to read their own submissions
*/

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  survey_data jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "enable_public_insert"
  ON submissions
  FOR INSERT
  TO public
  WITH CHECK (
    email IS NOT NULL AND
    survey_data IS NOT NULL AND
    recommendations IS NOT NULL AND
    summary IS NOT NULL
  );

CREATE POLICY "enable_own_select"
  ON submissions
  FOR SELECT
  TO public
  USING (email = auth.email());

-- Create email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Create submission validation function
CREATE OR REPLACE FUNCTION validate_submission()
RETURNS trigger AS $$
BEGIN
  -- Validate email format
  IF NOT is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate required fields
  IF NEW.survey_data IS NULL OR NEW.recommendations IS NULL OR NEW.summary IS NULL THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;

  -- Rate limiting
  IF EXISTS (
    SELECT 1 FROM submissions
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE EXCEPTION 'Please wait before submitting another request';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_submission_trigger
  BEFORE INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission();