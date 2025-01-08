import { supabase } from '../supabase';
import type { CRMSurveyData, CRMRecommendation } from '../../types';

// Test function to verify database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('submissions').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Test function to verify data insertion
export async function testDataInsertion(testData: {
  email: string;
  survey_data: any;
  recommendations: any[];
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('submissions')
      .insert(testData);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Data insertion test failed:', error);
    return false;
  }
}

export async function saveSubmission(
  email: string,
  surveyData: CRMSurveyData,
  recommendations: CRMRecommendation[]
): Promise<void> {
  try {
    // 1. First test database connection
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // 2. Validate input
    if (!email || !surveyData || !recommendations?.length) {
      throw new Error('Missing required submission data');
    }

    // 3. Test with minimal data first
    const testResult = await testDataInsertion({
      email,
      survey_data: { test: true },
      recommendations: [{ test: true }]
    });

    if (!testResult) {
      throw new Error('Test insertion failed');
    }

    // 4. If test passes, try actual insertion
    const { error } = await supabase
      .from('submissions')
      .insert({
        email,
        survey_data: surveyData,
        recommendations,
        summary: 'Test summary' // Simplified for testing
      });

    if (error) {
      console.error('Submission error:', error);
      throw new Error('Unable to save submission');
    }
  } catch (error) {
    console.error('Submission process failed:', error);
    throw error instanceof Error ? error : new Error('Failed to save submission');
  }
}