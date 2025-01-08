/*
  # Add email sending trigger

  1. Changes
    - Add trigger to send email when new submission is created
    - Use Edge Function to handle email sending
*/

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