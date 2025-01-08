/*
  # Update rate limiting duration

  1. Changes
    - Reduce rate limiting duration from 1 hour to 1 minute
    - Update validation trigger to use new duration
*/

-- Update validation function with shorter rate limit duration
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

  -- Rate limiting - changed from 1 hour to 1 minute
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