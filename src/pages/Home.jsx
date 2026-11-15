import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { announceSmartechPage } from '../smartechPage';

const FEATURED = PRODUCTS.slice(0, 3);

export function Home() {
  useEffect(() => {
    announceSmartechPage('home page');
  }, []);

  return (
    <div className="page-container home-page">
      <header className="page-header storefront-hero">
        <p className="eyebrow">Orbit Gear</p>
        <h1>Hardware that keeps pace</h1>
        <p className="subtitle">
          Shop peripherals, displays, and cooling — with the same SPA navigation
          scenarios this sandbox was built to exercise.
        </p>
        <div className="btn-group">
          <Link to="/products" className="btn btn-primary">
            Shop all
          </Link>
          <Link to="/#featured" className="btn btn-secondary">
            Jump to featured
          </Link>
        </div>
      </header>

      <section id="featured" className="store-section">
        <div className="section-heading">
          <h2>Featured gear</h2>
          <p>Scenario 1 &amp; 7: in-page anchors update the hash and fire anchorchange.</p>
        </div>
        <div className="product-grid">
          {FEATURED.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="spacer-md"></div>

      <div className="grid grid-2">
        <div className="card glass-card">
          <div className="card-header">
            <h2>Scenario 1 &amp; 7: Navigation &amp; Anchors</h2>
          </div>
          <p>
            Use store links or jump to in-page sections. Anchor updates change the
            hash sub-route and trigger <code>anchorchange</code> events.
          </p>
          <div className="btn-group">
            <Link to="/#featured" className="btn btn-primary">
              Scroll to Featured
            </Link>
            <Link to="/#new-arrivals" className="btn btn-secondary">
              Scroll to New Arrivals
            </Link>
          </div>
        </div>

        <div className="card glass-card">
          <div className="card-header">
            <h2>Scenario 8: Page Visibility</h2>
          </div>
          <p>
            Switch tabs or minimize the window. The SDK log should show{' '}
            <code>visibility</code> hidden/visible events.
          </p>
          <div className="visibility-guide">
            <span className="pulse-indicator"></span>
            <span>Watch the event stream panel while you leave and return.</span>
          </div>
        </div>
      </div>

      <div className="spacer-md"></div>

      <section id="new-arrivals" className="store-section anchor-section">
        <div className="section-content glass-card">
          <span className="section-tag">Target</span>
          <h2>New arrivals</h2>
          <p>
            You landed on this section via an in-page anchor. In HashRouter this
            becomes something like <code>#/#new-arrivals</code>, so the tracker can
            catch the anchor change without a route swap.
          </p>
          <div className="product-grid product-grid-compact">
            {PRODUCTS.slice(3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="spacer-sm"></div>
          <Link to="/" className="btn btn-outline btn-sm">
            Back to top
          </Link>
        </div>
      </section>

      <div className="spacer-lg"></div>
    </div>
  );
}

export default Home;
