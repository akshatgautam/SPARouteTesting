import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function NavBar() {
  const navigate = useNavigate();
  const { itemCount, openCart } = useCart();
  const [query, setQuery] = useState('');

  const triggerBack = () => {
    window.history.back();
  };

  const triggerForward = () => {
    window.history.forward();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-pulse"></span>
        <NavLink to="/" className="logo-text">
          Orbit Gear
        </NavLink>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Shop
        </NavLink>
        <NavLink
          to="/lab"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Nav Lab
        </NavLink>
      </div>

      <form className="navbar-search" onSubmit={handleSearch} role="search">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-control">
          Search
        </button>
      </form>

      <div className="navbar-actions">
        <button
          type="button"
          className="cart-trigger"
          onClick={openCart}
          aria-label={`Open cart, ${itemCount} items`}
        >
          <span className="cart-trigger-label">Cart</span>
          {itemCount > 0 && (
            <span className="cart-badge">{itemCount}</span>
          )}
        </button>

        <div className="navbar-controls">
          <span className="controls-label">Browser Simulator</span>
          <button
            className="btn btn-control"
            onClick={triggerBack}
            title="Go back in history"
            type="button"
          >
            ← Back
          </button>
          <button
            className="btn btn-control"
            onClick={triggerForward}
            title="Go forward in history"
            type="button"
          >
            Forward →
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
