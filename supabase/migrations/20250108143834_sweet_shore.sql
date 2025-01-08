/*
  # Fix email sending functionality
  
  1. Changes
    - Create new email sending trigger
    - Add Resend integration
    - Simplify table structure
*/

-- First clean up any existing objects
DROP TABLE IF EXISTS submissions CASCADE;

-- Create submissions table with all required fields
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  survey_data jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create simple policy for public access
CREATE POLICY "enable_public_access"
  ON submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to send email via Edge Function
CREATE OR REPLACE FUNCTION handle_new_submission()
RETURNS trigger AS $$
BEGIN
  -- Call Edge Function to send email
  PERFORM net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'to', NEW.email,
      'subject', 'Your CRM Recommendations',
      'html', NEW.summary
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send email on new submission
CREATE TRIGGER on_submission_created
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_submission();