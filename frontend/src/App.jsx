import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DepressionPredictor from './components/DepressionPredictor';
import SearchDatabase from './components/SearchDatabase';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<DepressionPredictor />} />
          <Route path="/search" element={<SearchDatabase />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
