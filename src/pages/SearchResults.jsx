import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { searchProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import { announceSmartechPage } from '../smartechPage';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [draft, setDraft] = useState(query);
  const results = searchProducts(query);

  useEffect(() => {
    announceSmartechPage('search results');
  }, []);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="page-container search-page">
      <header className="page-header">
        <h1>Search results</h1>
        <p className="subtitle">
          Scenario 6: changing <code>?q=</code> fires <code>querychange</code>{' '}
          without leaving the search route.
        </p>
      </header>

      <form className="search-page-form" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search by name, category, or tag…"
          aria-label="Search query"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="search-meta">
        {query ? (
          <p>
            {results.length} result{results.length === 1 ? '' : 's'} for{' '}
            <strong>&ldquo;{query}&rdquo;</strong>
          </p>
        ) : (
          <p>Enter a query to search the catalog.</p>
        )}
        <div className="btn-group">
          <Link to="/search?q=wireless" className="btn btn-outline btn-sm">
            Try &ldquo;wireless&rdquo;
          </Link>
          <Link to="/search?q=monitor" className="btn btn-outline btn-sm">
            Try &ldquo;monitor&rdquo;
          </Link>
          <Link to="/search?q=cooling" className="btn btn-outline btn-sm">
            Try &ldquo;cooling&rdquo;
          </Link>
        </div>
      </div>

      {query && results.length === 0 ? (
        <div className="empty-catalog glass-card">
          <p>No products matched that search.</p>
          <Link to="/products" className="btn btn-secondary">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
