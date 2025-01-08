import { supabase } from '../supabase';
import type { CRMSurveyData, CRMRecommendation } from '../../types';
import { generatePDF } from '../pdf';

export async function saveSubmission(
  email: string,
  surveyData: CRMSurveyData,
  recommendations: CRMRecommendation[]
): Promise<string> {
  try {
    // Validate input
    if (!email || !surveyData || !recommendations?.length) {
      throw new Error('Missing required submission data');
    }

    // Generate summary first
    const summary = generateEmailSummary(surveyData, recommendations);

    // Attempt insert
    const { data, error } = await supabase
      .from('email_submissions')
      .insert({
        email,
        survey_data: surveyData,
        recommendations,
        summary
      })
      .select()
      .single();

    if (error) {
      // Enhanced error handling with specific messages
      switch(error.code) {
        case 'P0001': // Custom validation error (rate limiting)
          throw new Error(error.message);
        case '23505': // Unique violation
          throw new Error('You have already requested a report with this email');
        case '23502': // Not null violation
          throw new Error('Missing required fields. Please try again.');
        case '22P02': // Invalid text representation
          throw new Error('Invalid data format. Please try again.');
        case '42501': // RLS violation
          throw new Error('Permission denied. Please try again.');
        default:
          console.error('Unexpected error:', error);
          throw new Error('Unable to save your submission. Please try again later.');
      }
    }

    if (!data) {
      throw new Error('Failed to confirm submission. Please try again.');
    }

    return summary;
  } catch (error) {
    console.error('Submission error:', error);
    throw error instanceof Error ? error : new Error('Failed to save submission');
  }
}

function generateEmailSummary(surveyData: CRMSurveyData, recommendations: CRMRecommendation[]): string {
  const surveyInfo = `
    <div>
      <h3>Your Requirements</h3>
      <p><strong>Industry:</strong> ${surveyData.industry}</p>
      <p><strong>Company Size:</strong> ${surveyData.companySize}</p>
      <p><strong>Budget:</strong> ${surveyData.budget}</p>
      <p><strong>Required Features:</strong> ${surveyData.features.join(', ')}</p>
    </div>
  `;

  const recommendationsHtml = recommendations
    .map(
      (rec, index) => `
        <div>
          <h2>${index + 1}. ${rec.name}</h2>
          <p>${rec.summary}</p>
          <p><strong>Price:</strong> $${rec.price}/user/month</p>
          <p><strong>Rating:</strong> ${rec.rating}/5 (${rec.reviewCount} reviews)</p>
          <p><strong>Key Features:</strong></p>
          <ul>
            ${rec.features.slice(0, 5).map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `
    )
    .join('\n');

  return `${surveyInfo}${recommendationsHtml}`;
}