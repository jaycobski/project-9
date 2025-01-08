import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRandomFact } from '../hooks/useRandomFact';

export function LoadingScreen() {
  const { fact, isLoading: isFactLoading } = useRandomFact();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center space-y-8">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Requirements...</h2>
        <p className="text-gray-600 mt-2">Finding the perfect CRM match for your business</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {progress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {!isFactLoading && fact && (
        <div className="max-w-md mx-auto bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Did you know?</h3>
          <p className="text-blue-800">{fact}</p>
        </div>
      )}
    </div>
  );
}