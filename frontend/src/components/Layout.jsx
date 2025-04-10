import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Legacy Mental Health Assistant</Link>
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link 
            to="/predict" 
            className={location.pathname === '/predict' ? 'active' : ''}
          >
            Depression Predictor
          </Link>
          <Link 
            to="/search" 
            className={location.pathname === '/search' ? 'active' : ''}
          >
            Search Database
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>© 2024 Legacy Mental Health Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout; 