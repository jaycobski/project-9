import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Professional Services',
  'Other',
];

export function IndustryStep({ value, onChange, onNext }: Props) {
  const handleSelect = (industry: string) => {
    onChange(industry);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">What industry are you in?</h2>
        <p className="mt-2 text-gray-600">
          This helps us recommend CRMs with features specific to your industry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industries.map((industry) => (
          <button
            key={industry}
            onClick={() => handleSelect(industry)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              value === industry
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="font-medium">{industry}</span>
          </button>
        ))}
      </div>
    </div>
  );
}