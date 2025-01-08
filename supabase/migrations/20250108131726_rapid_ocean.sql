/*
  # Fix email submissions policies

  1. Changes
    - Drop all existing policies
    - Create new simplified policies
    - Update validation function
*/

-- First drop ALL existing policies
DO $$ 
BEGIN
  -- Drop all policies on email_submissions
  EXECUTE (
    SELECT string_agg(
      format('DROP POLICY IF EXISTS %I ON email_submissions', policyname), '; '
    )
    FROM pg_policies 
    WHERE tablename = 'email_submissions'
  );
END $$;

-- Create new simplified validation function
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

  -- Rate limiting - 1 minute cooldown
  IF EXISTS (
    SELECT 1 FROM email_submissions
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 minute'
  ) THEN
    RAISE EXCEPTION 'Please wait before submitting another request';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_submission_trigger ON email_submissions;
CREATE TRIGGER validate_submission_trigger
  BEFORE INSERT ON email_submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission();

-- Create new simplified policies
CREATE POLICY "enable_all_operations"
  ON email_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;