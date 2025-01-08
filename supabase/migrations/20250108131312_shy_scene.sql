/*
  # Simplify email submissions validation
  
  1. Changes
    - Remove Edge Function dependency
    - Simplify validation trigger
    - Keep only essential RLS policies
*/

-- Drop existing complex functions
DROP FUNCTION IF EXISTS send_crm_recommendations_email CASCADE;
DROP FUNCTION IF EXISTS send_crm_email CASCADE;
DROP FUNCTION IF EXISTS send_resend_email CASCADE;

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
CREATE TRIGGER validate_submission_trigger
  BEFORE INSERT ON email_submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission();

-- Drop existing policies
DROP POLICY IF EXISTS "enable_insert_for_public" ON email_submissions;
DROP POLICY IF EXISTS "enable_public_insert" ON email_submissions;
DROP POLICY IF EXISTS "enable_select_for_owner" ON email_submissions;
DROP POLICY IF EXISTS "enable_public_select" ON email_submissions;
DROP POLICY IF EXISTS "allow_insert_for_public" ON email_submissions;
DROP POLICY IF EXISTS "allow_select_for_public" ON email_submissions;
DROP POLICY IF EXISTS "allow_insert_for_all" ON email_submissions;
DROP POLICY IF EXISTS "allow_select_for_all" ON email_submissions;

-- Create new simplified policies
CREATE POLICY "enable_insert_for_all"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_select_for_all"
  ON email_submissions
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;