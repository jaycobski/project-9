import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SurveyProgress } from '../../components/SurveyProgress';
import { IndustryStep } from './steps/IndustryStep';
import { CompanySizeStep } from './steps/CompanySizeStep';
import { BudgetStep } from './steps/BudgetStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { type CRMSurveyData } from '../../types';

export function SurveyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<CRMSurveyData>({
    industry: '',
    companySize: '',
    budget: '',
    features: [],
    primaryUse: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/results', { state: { surveyData } });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {currentStep === 1 && (
          <IndustryStep 
            value={surveyData.industry}
            onChange={(industry) => setSurveyData({ ...surveyData, industry })}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <CompanySizeStep
            value={surveyData.companySize}
            onChange={(companySize) => setSurveyData({ ...surveyData, companySize })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <BudgetStep
            value={surveyData.budget}
            onChange={(budget) => setSurveyData({ ...surveyData, budget })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <FeaturesStep
            value={surveyData.features}
            onChange={(features) => setSurveyData({ ...surveyData, features })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}