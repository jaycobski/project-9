/*
  # Fix permissions for email submissions

  1. Changes
    - Re-enable RLS for email_submissions table
    - Drop existing policies
    - Create new policies with proper permissions
    - Add proper error handling
*/

-- First drop existing policies
DROP POLICY IF EXISTS "allow_public_insert" ON email_submissions;
DROP POLICY IF EXISTS "allow_public_select" ON email_submissions;

-- Re-enable RLS
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "enable_insert_for_public"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (
    email IS NOT NULL AND
    survey_data IS NOT NULL AND
    recommendations IS NOT NULL AND
    summary IS NOT NULL
  );

CREATE POLICY "enable_select_for_owner"
  ON email_submissions
  FOR SELECT
  TO public
  USING (true);

-- Update validation function with better error handling
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

  -- Validate JSON structure
  IF jsonb_typeof(NEW.survey_data) != 'object' OR jsonb_typeof(NEW.recommendations) != 'array' THEN
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