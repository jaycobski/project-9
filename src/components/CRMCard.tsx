import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import type { CRMRecommendation } from '../types';
import { EmailCapture } from './EmailCapture';
import type { CRMSurveyData } from '../types';

interface CRMCardProps {
  recommendation: CRMRecommendation;
  surveyData: CRMSurveyData;
  recommendations: CRMRecommendation[];
}

export function CRMCard({ recommendation, surveyData, recommendations }: CRMCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{recommendation.name}</h3>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(recommendation.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                ({recommendation.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(recommendation.price)}
            </div>
            <div className="text-sm text-gray-500">per user/month</div>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{recommendation.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {recommendation.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {feature}
            </span>
          ))}
          {recommendation.features.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm flex items-center"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="ml-1 w-4 h-4" />
                </>
              ) : (
                <>
                  +{recommendation.features.length - 3} More{' '}
                  <ChevronDown className="ml-1 w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {recommendation.features.slice(3).map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">User Sentiment</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-20 text-sm text-gray-600">Positive</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${recommendation.sentiment.positive}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {recommendation.sentiment.positive}%
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-sm text-gray-600">Neutral</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${recommendation.sentiment.neutral}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {recommendation.sentiment.neutral}%
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-sm text-gray-600">Negative</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${recommendation.sentiment.negative}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {recommendation.sentiment.negative}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {showEmailCapture ? (
            <EmailCapture
              surveyData={surveyData}
              recommendations={recommendations}
            />
          ) : (
            <button
              onClick={() => setShowEmailCapture(true)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              Get Detailed Report & Special Offers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}