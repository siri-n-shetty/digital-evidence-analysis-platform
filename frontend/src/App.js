import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import AnalysisPage from './AnalysisPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage/>} />
        <Route path="/analysis" element={<AnalysisPage/>} />
      </Routes>
    </Router>
  );
};

export default App;