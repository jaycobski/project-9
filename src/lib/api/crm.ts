import { supabase } from '../supabase';
import { generateCRMRecommendations } from '../perplexity';
import type { CRMRecommendation, CRMSurveyData } from '../../types';

export async function getCRMRecommendations(
  surveyData: CRMSurveyData
): Promise<CRMRecommendation[]> {
  return generateCRMRecommendations(surveyData);
}