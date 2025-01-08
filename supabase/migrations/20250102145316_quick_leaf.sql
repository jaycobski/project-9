/*
  # Add email trigger for submissions

  1. Changes
    - Creates a trigger function to send emails when new submissions are created
    - Adds a trigger to automatically send emails for new submissions

  2. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Uses secure HTTP POST for email sending
*/

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Send email using Supabase's email service
  PERFORM net.http_post(
    url := net.http_build_url(
      'v1/send-email',
      ARRAY[
        ROW('api_key', current_setting('app.settings.service_role_key'))::http_param
      ]
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'to', NEW.email,
      'subject', 'Your CRM Recommendations',
      'html', format(
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Your CRM Recommendations</h1>
          <p style="color: #374151; margin-bottom: 20px;">
            Thank you for using CRM Matchmaker! Here are your personalized CRM recommendations:
          </p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap;">
            %s
          </div>
          <p style="color: #374151; margin-top: 20px;">
            For more detailed information and special offers, visit our website.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent by CRM Matchmaker. You can unsubscribe at any time.
          </p>
        </div>',
        NEW.summary
      )
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_submission_created ON submissions;
CREATE TRIGGER on_submission_created
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_submission();