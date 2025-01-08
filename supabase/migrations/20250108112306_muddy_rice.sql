/*
  # Set up Resend email configuration
  
  1. Email Configuration
    - Create function to send emails via Resend
    - Configure secure email sending
  2. Security
    - Add proper permissions and security context
*/

-- Create Resend email sending function
CREATE OR REPLACE FUNCTION send_crm_email(
  to_email text,
  survey_data jsonb,
  recommendations jsonb,
  pdf_content text
)
RETURNS void AS $$
BEGIN
  PERFORM net.http_post(
    'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', format('Bearer %s', current_setting('app.settings.resend_api_key')),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'CRM Matchmaker <recommendations@crmmatchmaker.com>',
      'to', to_email,
      'subject', 'Your CRM Recommendations',
      'html', format(
        E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">\n' ||
        E'  <h1 style="color: #2563eb;">Your CRM Recommendations</h1>\n' ||
        E'  <p>Thank you for using CRM Matchmaker! Please find your personalized CRM recommendations attached.</p>\n' ||
        E'  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">\n' ||
        E'    <h2 style="color: #1e40af; margin-bottom: 10px;">Your Requirements</h2>\n' ||
        E'    <p><strong>Industry:</strong> %s</p>\n' ||
        E'    <p><strong>Company Size:</strong> %s</p>\n' ||
        E'    <p><strong>Budget:</strong> %s</p>\n' ||
        E'    <p><strong>Required Features:</strong> %s</p>\n' ||
        E'  </div>\n' ||
        E'  <p>We''ve attached a detailed PDF report with your recommendations.</p>\n' ||
        E'</div>',
        survey_data->>'industry',
        survey_data->>'companySize',
        survey_data->>'budget',
        array_to_string(ARRAY(SELECT jsonb_array_elements_text(survey_data->'features')), ', ')
      ),
      'attachments', jsonb_build_array(
        jsonb_build_object(
          'content', pdf_content,
          'filename', 'crm-recommendations.pdf',
          'type', 'application/pdf'
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;