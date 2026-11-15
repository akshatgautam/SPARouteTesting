import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProductsByCategory, PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { announceSmartechPage } from '../smartechPage';

const CATEGORIES = ['all', ...new Set(PRODUCTS.map((p) => p.category))];

export function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const products = getProductsByCategory(category);

  useEffect(() => {
    announceSmartechPage('category/listing page');
  }, []);

  const handleCategory = (next) => {
    if (next === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: next });
    }
  };

  return (
    <div className="page-container listing-page">
      <header className="page-header">
        <h1>Shop</h1>
        <p className="subtitle">
          Product listing with category filters via query params — Scenario 6 style
          mutations on a collection page.
        </p>
      </header>

      <div className="filter-bar">
        <span className="scen-label">Filter by category (?category=)</span>
        <div className="filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <p className="listing-count">
        Showing {products.length} product{products.length === 1 ? '' : 's'}
        {category !== 'all' ? ` in ${category}` : ''}.
      </p>

      {products.length === 0 ? (
        <div className="empty-catalog glass-card">
          <p>No products in this category.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleCategory('all')}
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="spacer-md"></div>
      <p className="text-secondary">
        Looking for something specific? Try{' '}
        <Link to="/search?q=wireless">searching for wireless</Link>.
      </p>
    </div>
  );
}

export default ProductListing;
