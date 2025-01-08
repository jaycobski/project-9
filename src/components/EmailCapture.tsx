import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { saveSubmission } from '../lib/api/submissions';
import type { CRMSurveyData, CRMRecommendation } from '../types';

interface Props {
  surveyData: CRMSurveyData;
  recommendations: CRMRecommendation[];
}

export function EmailCapture({ surveyData, recommendations }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }

      await saveSubmission(email, surveyData, recommendations);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to save submission. Please try again.'
      );
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <h3 className="text-green-800 font-medium mb-2">Thank you for subscribing!</h3>
        <p className="text-green-600">Your personalized CRM report will be sent to {email} shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Get Your Free CRM Report</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Subscribe to receive a detailed PDF report of your CRM recommendations
        plus exclusive insights and special offers.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Get Free Report
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-4">
        By subscribing, you agree to receive occasional updates and special offers.
        You can unsubscribe at any time.
      </p>
    </div>
  );
}