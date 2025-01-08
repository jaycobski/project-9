import { jsPDF } from 'jspdf';
import type { CRMSurveyData, CRMRecommendation } from '../types';
import { formatPrice } from './utils';

export function generatePDF(surveyData: CRMSurveyData, recommendations: CRMRecommendation[]): void {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  let yPos = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(20);
  doc.text('Your CRM Recommendations', margin, yPos);
  yPos += lineHeight * 2;

  // Survey Requirements
  doc.setFontSize(16);
  doc.text('Your Requirements', margin, yPos);
  yPos += lineHeight;

  doc.setFontSize(12);
  doc.text(`Industry: ${surveyData.industry}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Company Size: ${surveyData.companySize}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Budget: ${surveyData.budget}`, margin, yPos);
  yPos += lineHeight;
  doc.text('Required Features:', margin, yPos);
  yPos += lineHeight;

  // Features list
  surveyData.features.forEach(feature => {
    doc.text(`• ${feature}`, margin + 5, yPos);
    yPos += lineHeight;
  });

  yPos += lineHeight;

  // Recommendations
  recommendations.forEach((rec, index) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text(`${index + 1}. ${rec.name}`, margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(rec.summary, pageWidth - (margin * 2));
    doc.text(summaryLines, margin, yPos);
    yPos += lineHeight * summaryLines.length;

    doc.text(`Price: ${formatPrice(rec.price)}/user/month`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Rating: ${rec.rating}/5 (${rec.reviewCount} reviews)`, margin, yPos);
    yPos += lineHeight;

    doc.text('Key Features:', margin, yPos);
    yPos += lineHeight;
    rec.features.slice(0, 5).forEach(feature => {
      doc.text(`• ${feature}`, margin + 5, yPos);
      yPos += lineHeight;
    });

    yPos += lineHeight;
  });

  // Save the PDF
  doc.save('crm-recommendations.pdf');
}