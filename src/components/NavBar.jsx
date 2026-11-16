import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function NavBar() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="brand">
          Orbit Gear
        </Link>

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
        </div>

        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gear…"
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-ghost btn-sm">
            Search
          </button>
        </form>

        <Link to="/cart" className="cart-link" aria-label={`Cart, ${itemCount} items`}>
          Cart
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </nav>
    </header>
  );
}

export default NavBar;
