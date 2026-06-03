import React from 'react';
import { NavLink } from 'react-router-dom';

export function NavBar() {
  const triggerBack = () => {
    window.history.back();
  };

  const triggerForward = () => {
    window.history.forward();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-pulse"></span>
        <span className="logo-text">WebSDK Sandbox</span>
      </div>

      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink 
          to="/products/1" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Products
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          About
        </NavLink>
      </div>

      <div className="navbar-controls">
        <span className="controls-label">Browser Simulator</span>
        <button className="btn btn-control" onClick={triggerBack} title="Go back in history">
          ← Back
        </button>
        <button className="btn btn-control" onClick={triggerForward} title="Go forward in history">
          Forward →
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
