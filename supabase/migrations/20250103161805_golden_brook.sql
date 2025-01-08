/*
  # Fix email submissions policies and validation

  1. Changes
    - Drop existing policies
    - Create new simplified policies
    - Update validation trigger
    - Add proper error handling
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_insert_for_all" ON email_submissions;
DROP POLICY IF EXISTS "allow_select_for_all" ON email_submissions;

-- Create new policies with proper access control
CREATE POLICY "enable_public_insert"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (
    -- Basic validation only, detailed validation in trigger
    email IS NOT NULL AND
    survey_data IS NOT NULL AND
    recommendations IS NOT NULL AND
    summary IS NOT NULL
  );

CREATE POLICY "enable_public_select"
  ON email_submissions
  FOR SELECT
  TO public
  USING (true);

-- Update validation trigger
CREATE OR REPLACE FUNCTION validate_submission()
RETURNS trigger AS $$
BEGIN
  -- Validate email format
  IF NOT is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate JSON fields
  IF NOT (
    jsonb_typeof(NEW.survey_data) = 'object' AND
    jsonb_typeof(NEW.recommendations) = 'array'
  ) THEN
    RAISE EXCEPTION 'Invalid data format';
  END IF;

  -- Rate limiting
  IF EXISTS (
    SELECT 1 FROM email_submissions
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE EXCEPTION 'Please wait before submitting another request';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;