import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface FeaturesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const features = [
  'Contact Management',
  'Lead Tracking',
  'Email Marketing',
  'Sales Pipeline',
  'Task Management',
  'Reporting & Analytics',
  'Mobile App',
  'Third-party Integrations',
  'Automation',
  'Customer Support',
  'Document Management',
  'Team Collaboration',
];

export function FeaturesStep({ value, onChange, onNext, onBack }: FeaturesStepProps) {
  const toggleFeature = (feature: string) => {
    if (value.includes(feature)) {
      onChange(value.filter((f) => f !== feature));
    } else {
      onChange([...value, feature]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">What features do you need?</h2>
        <p className="mt-2 text-gray-600">
          Select all the features that are important for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <button
            key={feature}
            onClick={() => toggleFeature(feature)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              value.includes(feature)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="flex items-center">
              {value.includes(feature) && (
                <Check className="w-5 h-5 text-blue-600 mr-2" />
              )}
              <span className="font-medium">{feature}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={value.length === 0}
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          See Results
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}