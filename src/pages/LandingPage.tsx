import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const benefits = [
    'Personalized CRM recommendations based on your needs',
    'Compare features, pricing, and user reviews',
    'Save hours of research time',
    'Get detailed insights from real user experiences',
  ];

  return (
    <div className="space-y-12">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Find Your Perfect CRM Match in Minutes
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Answer a few questions about your business needs and get AI-powered
          recommendations from over 1,200 CRM solutions.
        </p>
        <Link
          to="/survey"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Start Finding Your CRM
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why Use CRM Matchmaker?
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
            alt="Team collaboration"
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="text-center bg-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to find your perfect CRM?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of businesses who found their ideal CRM solution through our platform.
        </p>
        <Link
          to="/survey"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Start Free Assessment
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}