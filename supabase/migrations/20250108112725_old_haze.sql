/*
  # Configure Resend email integration
  
  1. Create a secure function for sending emails via Resend
  2. Use security definer to ensure proper permissions
*/

-- Create or replace the email sending function with embedded API key
CREATE OR REPLACE FUNCTION send_resend_email(
  to_email text,
  subject text,
  html_content text,
  attachments jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  PERFORM net.http_post(
    'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer re_Vq6DTFVF_K1xmdsheLADueGTUyWGESJy8',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'CRM Matchmaker <recommendations@crmmatchmaker.com>',
      'to', to_email,
      'subject', subject,
      'html', html_content,
      'attachments', COALESCE(attachments, '[]'::jsonb)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;