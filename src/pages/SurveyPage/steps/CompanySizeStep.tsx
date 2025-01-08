import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

export function CompanySizeStep({ value, onChange, onNext, onBack }: Props) {
  const handleSelect = (size: string) => {
    onChange(size);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">How large is your company?</h2>
        <p className="mt-2 text-gray-600">
          We'll match you with CRMs that scale well for your company size.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companySizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSelect(size)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              value === size
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="font-medium">{size}</span>
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