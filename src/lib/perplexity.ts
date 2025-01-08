import type { CRMSurveyData, CRMRecommendation } from '../types';

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  throw new Error('Missing Perplexity API key');
}

const API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

function generatePrompt(surveyData: CRMSurveyData): string {
  return `Return ONLY a raw JSON array of 3 CRM recommendations based on these requirements. NO markdown, NO explanation, ONLY the JSON array.

Industry: ${surveyData.industry}
Company Size: ${surveyData.companySize}
Budget: ${surveyData.budget}
Required Features: ${surveyData.features.join(', ')}

Format: [{"name":"CRM Name","price":50,"features":["Feature1"],"summary":"Description","rating":4.5,"reviewCount":1000,"sentiment":{"positive":75,"negative":10,"neutral":15}}]`;
}

function validateRecommendation(rec: any): rec is CRMRecommendation {
  return (
    typeof rec === 'object' &&
    typeof rec.name === 'string' &&
    typeof rec.price === 'number' &&
    Array.isArray(rec.features) &&
    rec.features.every(f => typeof f === 'string') &&
    typeof rec.summary === 'string' &&
    typeof rec.rating === 'number' &&
    typeof rec.reviewCount === 'number' &&
    typeof rec.sentiment === 'object' &&
    typeof rec.sentiment.positive === 'number' &&
    typeof rec.sentiment.negative === 'number' &&
    typeof rec.sentiment.neutral === 'number'
  );
}

export async function generateCRMRecommendations(
  surveyData: CRMSurveyData
): Promise<CRMRecommendation[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { 
            role: 'system', 
            content: 'You are a JSON-only response bot. Always return raw JSON without any markdown formatting or explanation.'
          },
          { 
            role: 'user', 
            content: generatePrompt(surveyData) 
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error:', errorText);
      throw new Error('Failed to generate recommendations. Please try again later.');
    }

    const data: PerplexityResponse = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from recommendation service');
    }

    try {
      const content = data.choices[0].message.content;
      // Remove any markdown formatting if present
      const cleanContent = content.replace(/^```json\n|\n```$/g, '').trim();
      
      let parsedContent: any;
      try {
        parsedContent = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Raw content:', content);
        console.error('Cleaned content:', cleanContent);
        throw new Error('Invalid response format from recommendation service');
      }

      const recommendations = parsedContent.filter(validateRecommendation);

      if (recommendations.length === 0) {
        throw new Error('No valid recommendations received');
      }

      return recommendations.map(rec => ({
        ...rec,
        id: crypto.randomUUID()
      }));
    } catch (parseError) {
      console.error('Failed to parse recommendations:', parseError);
      console.error('Raw response:', data.choices[0].message.content);
      throw new Error('Failed to process recommendations. Please try again.');
    }
  } catch (error) {
    console.error('Error generating CRM recommendations:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}