import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const budgetRanges = [
  'Free',
  '$1-10 per user/month',
  '$11-25 per user/month',
  '$26-50 per user/month',
  '$51-100 per user/month',
  '$100+ per user/month',
];

export function BudgetStep({ value, onChange, onNext, onBack }: Props) {
  const handleSelect = (budget: string) => {
    onChange(budget);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">What's your budget per user?</h2>
        <p className="mt-2 text-gray-600">
          We'll find CRM solutions that fit within your budget range.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetRanges.map((budget) => (
          <button
            key={budget}
            onClick={() => handleSelect(budget)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              value === budget
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="font-medium">{budget}</span>
          </button>
        ))}
      </div>
      <div className="flex pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back
        </button>
      </div>
    </div>
  );
}