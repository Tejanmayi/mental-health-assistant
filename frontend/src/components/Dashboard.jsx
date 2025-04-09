import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data - in a real app, this would come from an API
  const stats = {
    totalPatients: 42,
    activeCases: 15,
    predictionsToday: 8,
    averageRisk: 'Medium'
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-value">{stats.totalPatients}</p>
        </div>
        <div className="stat-card">
          <h3>Active Cases</h3>
          <p className="stat-value">{stats.activeCases}</p>
        </div>
        <div className="stat-card">
          <h3>Predictions Today</h3>
          <p className="stat-value">{stats.predictionsToday}</p>
        </div>
        <div className="stat-card">
          <h3>Average Risk Level</h3>
          <p className="stat-value">{stats.averageRisk}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/predict" className="action-button">
            New Prediction
          </Link>
          <Link to="/search" className="action-button">
            Search Database
          </Link>
          <button className="action-button">
            Export Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 