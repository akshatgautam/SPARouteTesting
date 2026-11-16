import React from 'react';
import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-brand">Orbit Gear</p>
          <p className="footer-tagline">Hardware that keeps pace.</p>
        </div>
        <div className="footer-links">
          <Link to="/products">Shop</Link>
          <Link to="/search?q=wireless">Search</Link>
          <Link to="/cart">Cart</Link>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
