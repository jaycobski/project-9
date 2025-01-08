/*
  # Fix submission validation

  1. Changes
    - Drop existing trigger and function with CASCADE
    - Recreate validation function with 1-minute rate limiting
    - Create new validation trigger
*/

-- Drop existing trigger and function with CASCADE
DROP TRIGGER IF EXISTS validate_submission_trigger ON email_submissions CASCADE;
DROP FUNCTION IF EXISTS validate_submission() CASCADE;

-- Create new validation function without email sending
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