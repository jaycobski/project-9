import { useState, useEffect } from 'react';
import { getCRMRecommendations } from '../lib/api/crm';
import type { CRMRecommendation, CRMSurveyData } from '../types';

export function useCRMRecommendations(surveyData: CRMSurveyData) {
  const [recommendations, setRecommendations] = useState<CRMRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        if (!surveyData) {
          setError('Missing survey data');
          return;
        }

        const data = await getCRMRecommendations(surveyData);
        if (!data || data.length === 0) {
          setError('No recommendations found');
          return;
        }

        setRecommendations(data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Unable to process recommendations data'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [surveyData]);

  return { recommendations, isLoading, error };
}