import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { generatePDF } from '../lib/pdf';
import { CRMCard } from '../components/CRMCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { useCRMRecommendations } from '../hooks/useCRMRecommendations';
import type { CRMSurveyData } from '../types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const surveyData = location.state?.surveyData as CRMSurveyData;

  const { recommendations, isLoading, error } = useCRMRecommendations(surveyData);

  useEffect(() => {
    if (!surveyData) {
      navigate('/survey');
    }
  }, [surveyData, navigate]);

  if (!surveyData) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
        <p className="text-gray-600 mb-6">
          Please complete the survey to get your CRM recommendations.
        </p>
        <Link
          to="/survey"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Take Survey
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't generate recommendations at this time. Please try again.
        </p>
        <Link
          to="/survey"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Start Over
        </Link>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    generatePDF(surveyData, recommendations);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Your CRM Recommendations</h1>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </button>
      </div>

      <div className="space-y-6">
        {recommendations.map((recommendation) => (
          <CRMCard
            key={recommendation.id}
            recommendation={recommendation}
            surveyData={surveyData}
            recommendations={recommendations}
          />
        ))}
      </div>
    </div>
  );
}