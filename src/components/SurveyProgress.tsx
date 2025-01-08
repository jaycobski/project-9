import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function SurveyProgress({ currentStep, totalSteps }: SurveyProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className="flex items-center"
          >
            {index < currentStep ? (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            ) : (
              <div
                className={`w-5 h-5 rounded-full ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}