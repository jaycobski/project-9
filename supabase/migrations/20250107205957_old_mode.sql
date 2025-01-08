/*
  # Set up email service configuration

  1. Email Configuration
    - Enable email service
    - Set up email template for CRM recommendations
  2. Security
    - Configure secure email sending permissions
*/

-- Enable email service
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create email template function
CREATE OR REPLACE FUNCTION send_crm_recommendations_email(
  to_email text,
  survey_data jsonb,
  recommendations jsonb,
  pdf_content text
)
RETURNS void AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.email_function_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'to', to_email,
      'subject', 'Your CRM Recommendations',
      'html_content', format(
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