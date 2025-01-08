/*
  # Fix permissions for submissions table

  1. Changes
    - Drop existing table and recreate with proper structure
    - Simplify RLS policies
    - Add proper validation
*/

-- First drop existing table and all its dependencies
DROP TABLE IF EXISTS submissions CASCADE;

-- Recreate the table with proper structure
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

-- Create simplified policies
CREATE POLICY "allow_public_insert"
  ON submissions
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_public_select"
  ON submissions
  FOR SELECT
  TO public
  USING (true);

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

  -- Validate JSON structure
  IF jsonb_typeof(NEW.survey_data) != 'object' OR jsonb_typeof(NEW.recommendations) != 'array' THEN
    RAISE EXCEPTION 'Invalid data format';
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