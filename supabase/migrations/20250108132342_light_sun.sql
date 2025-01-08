/*
  # Fix email submissions

  1. Changes
    - Remove complex email sending logic
    - Simplify validation
    - Reset policies
    - Keep only essential functionality
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_submission_trigger ON email_submissions CASCADE;
DROP FUNCTION IF EXISTS validate_submission CASCADE;

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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_submission_trigger
  BEFORE INSERT ON email_submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission();

-- Drop all existing policies
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(
      format('DROP POLICY IF EXISTS %I ON email_submissions', policyname), '; '
    )
    FROM pg_policies 
    WHERE tablename = 'email_submissions'
  );
END $$;

-- Create new simplified policy
CREATE POLICY "enable_public_access"
  ON email_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;