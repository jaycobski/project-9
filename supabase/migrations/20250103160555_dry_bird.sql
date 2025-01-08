/*
  # Email Submissions System

  1. New Tables
    - `email_submissions`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `survey_data` (jsonb)
      - `recommendations` (jsonb)
      - `summary` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `email_submissions` table
    - Add policies for public insert and select
    - Add email validation function
    - Add submission validation trigger

  3. Email Handling
    - Add trigger for sending emails on new submissions
*/

-- Create email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Create email submissions table
CREATE TABLE IF NOT EXISTS email_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  survey_data jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "enable_insert_for_all"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_select_for_own_submissions"
  ON email_submissions
  FOR SELECT
  TO public
  USING (email = current_user);

-- Create submission validation function
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

  -- Rate limiting: Check for recent submissions from the same email
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

-- Create validation trigger
CREATE TRIGGER validate_submission_trigger
  BEFORE INSERT ON email_submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission();

-- Create email notification function
CREATE OR REPLACE FUNCTION handle_new_submission()
RETURNS trigger AS $$
BEGIN
  -- Send email using Edge Function
  PERFORM net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/send-crm-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'summary', NEW.summary
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create email notification trigger
CREATE TRIGGER on_submission_created
  AFTER INSERT ON email_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_submission();