/*
  # Fix RLS policies and enhance error handling

  1. Changes
    - Drop existing policies
    - Create new simplified policies for public access
    - Add detailed logging for debugging
    - Update validation function with better error messages

  2. Security
    - Enable RLS
    - Allow public insert access
    - Allow public select access for debugging
*/

-- First drop existing policies
DROP POLICY IF EXISTS "enable_insert_for_public" ON email_submissions;
DROP POLICY IF EXISTS "enable_select_for_owner" ON email_submissions;

-- Re-enable RLS
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "allow_insert_for_public"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_select_for_public"
  ON email_submissions
  FOR SELECT
  TO public
  USING (true);

-- Update validation function with enhanced logging
CREATE OR REPLACE FUNCTION validate_submission()
RETURNS trigger AS $$
DECLARE
  validation_error text;
BEGIN
  -- Log attempt
  RAISE LOG 'Validating submission for email: %, data: %', 
    NEW.email,
    jsonb_build_object(
      'survey_data', NEW.survey_data,
      'recommendations', NEW.recommendations
    );

  -- Email validation
  IF NOT is_valid_email(NEW.email) THEN
    validation_error := format('Invalid email format: %s', NEW.email);
    RAISE LOG 'Validation failed: %', validation_error;
    RAISE EXCEPTION '%', validation_error;
  END IF;

  -- Required fields validation
  IF NEW.survey_data IS NULL OR NEW.recommendations IS NULL OR NEW.summary IS NULL THEN
    validation_error := 'Missing required fields';
    RAISE LOG 'Validation failed: %', validation_error;
    RAISE EXCEPTION '%', validation_error;
  END IF;

  -- JSON structure validation
  IF jsonb_typeof(NEW.survey_data) != 'object' OR jsonb_typeof(NEW.recommendations) != 'array' THEN
    validation_error := format(
      'Invalid data format: survey_data=%s, recommendations=%s',
      jsonb_typeof(NEW.survey_data),
      jsonb_typeof(NEW.recommendations)
    );
    RAISE LOG 'Validation failed: %', validation_error;
    RAISE EXCEPTION '%', validation_error;
  END IF;

  -- Rate limiting
  IF EXISTS (
    SELECT 1 FROM email_submissions
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    validation_error := format('Rate limit exceeded for email: %s', NEW.email);
    RAISE LOG 'Validation failed: %', validation_error;
    RAISE EXCEPTION '%', validation_error;
  END IF;

  -- Log successful validation
  RAISE LOG 'Validation successful for email: %', NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;