import { serve } from 'https://deno.fresh.dev/std@v9.6.2/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || '';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587');
const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME') || '';
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || '';

serve(async (req) => {
  try {
    const { email, summary } = await req.json();

    // Validate input
    if (!email || !summary) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    });

    await client.send({
      from: SMTP_USERNAME,
      to: email,
      subject: 'Your CRM Recommendations',
      content: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #2563eb;">Your CRM Recommendations</h1>
            <p>Thank you for using CRM Matchmaker! Here are your personalized CRM recommendations:</p>
            <div style="white-space: pre-wrap; background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${summary}
            </div>
            <p>For more detailed information and special offers, please visit our website.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 0.875rem;">
              This email was sent by CRM Matchmaker. You can unsubscribe at any time.
            </p>
          </body>
        </html>
      `,
      html: true,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});