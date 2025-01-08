export interface CRMSurveyData {
  industry: string;
  companySize: string;
  budget: string;
  features: string[];
  primaryUse: string;
}

export interface CRMRecommendation {
  id: string;
  name: string;
  logo: string;
  price: number;
  rating: number;
  reviewCount: number;
  features: string[];
  summary: string;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}