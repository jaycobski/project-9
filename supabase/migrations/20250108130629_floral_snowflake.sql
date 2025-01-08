/*
  # Fix submission trigger

  1. Changes
    - Remove dependency on external configuration parameters
    - Simplify submission process
    - Keep rate limiting and validation
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_submission_trigger ON submissions;
DROP FUNCTION IF EXISTS validate_submission();

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
    SELECT 1 FROM submissions
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
  BEFORE INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission();