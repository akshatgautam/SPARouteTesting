import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { announceSmartechPage } from '../smartechPage';

const FEATURED = PRODUCTS.slice(0, 4);

export function Home() {
  useEffect(() => {
    announceSmartechPage('home page');
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="brand-mark">Orbit Gear</p>
          <h1>Build a desk that works as hard as you do</h1>
          <p className="hero-sub">
            Peripherals, displays, and cooling — tuned for everyday performance.
          </p>
          <div className="btn-group">
            <Link to="/products" className="btn btn-primary">
              Shop collection
            </Link>
            <Link to="/search?q=wireless" className="btn btn-secondary">
              Explore wireless
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <img
            src="https://picsum.photos/seed/orbitdesk/1600/1000"
            alt=""
          />
        </div>
      </section>

      <section className="store-section">
        <div className="section-heading">
          <h2>Featured gear</h2>
          <p>Staff picks from the current collection.</p>
        </div>
        <div className="product-grid">
          {FEATURED.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="section-cta">
          <Link to="/products" className="btn btn-ghost">
            View all products
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
