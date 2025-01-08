import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { SurveyPage } from './pages/SurveyPage';
import { ResultsPage } from './pages/ResultsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;