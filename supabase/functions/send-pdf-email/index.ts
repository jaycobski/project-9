import { serve } from 'https://deno.fresh.dev/std@v9.6.2/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { email, surveyData, recommendations } = await req.json();

    // Validate input
    if (!email || !surveyData || !recommendations) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate PDF
    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.text('Your CRM Recommendations', margin, yPos);
    yPos += lineHeight * 2;

    // Survey Requirements
    doc.setFontSize(16);
    doc.text('Your Requirements', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(12);
    doc.text(`Industry: ${surveyData.industry}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Company Size: ${surveyData.companySize}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Budget: ${surveyData.budget}`, margin, yPos);
    yPos += lineHeight;
    doc.text('Required Features:', margin, yPos);
    yPos += lineHeight;

    surveyData.features.forEach(feature => {
      doc.text(`• ${feature}`, margin + 5, yPos);
      yPos += lineHeight;
    });

    yPos += lineHeight;

    // Recommendations
    recommendations.forEach((rec, index) => {
      if (yPos > doc.internal.pageSize.height - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.text(`${index + 1}. ${rec.name}`, margin, yPos);
      yPos += lineHeight;

      doc.setFontSize(12);
      const summaryLines = doc.splitTextToSize(rec.summary, pageWidth - (margin * 2));
      doc.text(summaryLines, margin, yPos);
      yPos += lineHeight * summaryLines.length;

      doc.text(`Price: $${rec.price}/user/month`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Rating: ${rec.rating}/5 (${rec.reviewCount} reviews)`, margin, yPos);
      yPos += lineHeight;

      doc.text('Key Features:', margin, yPos);
      yPos += lineHeight;
      rec.features.slice(0, 5).forEach(feature => {
        doc.text(`• ${feature}`, margin + 5, yPos);
        yPos += lineHeight;
      });

      yPos += lineHeight;
    });

    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Send email using Supabase's email service
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: email,
        subject: 'Your CRM Recommendations',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Your CRM Recommendations</h1>
            <p>Thank you for using CRM Matchmaker! Please find your personalized CRM recommendations attached.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-bottom: 10px;">Your Requirements</h2>
              <p><strong>Industry:</strong> ${surveyData.industry}</p>
              <p><strong>Company Size:</strong> ${surveyData.companySize}</p>
              <p><strong>Budget:</strong> ${surveyData.budget}</p>
              <p><strong>Required Features:</strong> ${surveyData.features.join(', ')}</p>
            </div>
            <p>We've attached a detailed PDF report with your recommendations.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 0.875rem;">
              This email was sent by CRM Matchmaker. You can unsubscribe at any time.
            </p>
          </div>
        `,
        attachments: [{
          content: pdfBase64,
          filename: 'crm-recommendations.pdf',
          type: 'application/pdf'
        }]
      }
    });

    if (emailError) {
      throw emailError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});