import React, { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { PRODUCTS, getProductById, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { announceSmartechPage } from '../smartechPage';

export function ProductDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const { addItem } = useCart();

  const product = getProductById(id) || PRODUCTS[0];

  // Re-announce when switching between products (same route component)
  useEffect(() => {
    announceSmartechPage('product display page');
  }, [id]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Scenario 2: Explicit/raw History API calls
  const triggerRawPushState = () => {
    const customUrl = `#/products/${product.id}?tab=raw-pushstate-demo`;
    window.history.pushState(
      { demo: 'pushState', timestamp: Date.now() },
      'Raw pushState Demo',
      customUrl
    );
  };

  const triggerRawReplaceState = () => {
    const customUrl = `#/products/${product.id}?tab=raw-replacestate-demo`;
    window.history.replaceState(
      { demo: 'replaceState', timestamp: Date.now() },
      'Raw replaceState Demo',
      customUrl
    );
  };

  return (
    <div className="page-container products-page">
      <nav className="breadcrumb">
        <Link to="/products">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid grid-sidebar">
        <aside className="sidebar-cards">
          <h3>More products</h3>
          <span className="scen-label">Scenario 5: Dynamic Route Param (:id)</span>
          <div className="sidebar-nav">
            {PRODUCTS.map((prod) => (
              <Link
                key={prod.id}
                to={`/products/${prod.id}?tab=${currentTab}`}
                className={`sidebar-link ${product.id === prod.id ? 'active' : ''}`}
              >
                <div className="sidebar-link-title">{prod.name}</div>
                <div className="sidebar-link-price">{formatPrice(prod.price)}</div>
              </Link>
            ))}
          </div>
        </aside>

        <main className="product-display glass-card">
          <div className="pdp-layout">
            <div className="pdp-media">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="pdp-summary">
              <span className="product-card-category">{product.category}</span>
              <div className="product-info-header">
                <h1>{product.name}</h1>
                <div className="product-price">{formatPrice(product.price)}</div>
              </div>
              <p className="product-desc">{product.desc}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addItem(product)}
              >
                Add to cart
              </button>
            </div>
          </div>

          <div className="tabs-container">
            <span className="scen-label">Scenario 6: Query Param (?tab=)</span>
            <div className="tabs-header">
              <button
                type="button"
                className={`tab-btn ${currentTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                className={`tab-btn ${currentTab === 'specs' ? 'active' : ''}`}
                onClick={() => handleTabChange('specs')}
              >
                Specifications
              </button>
              <button
                type="button"
                className={`tab-btn ${currentTab === 'reviews' ? 'active' : ''}`}
                onClick={() => handleTabChange('reviews')}
              >
                Reviews
              </button>
            </div>
            <div className="tab-content">
              {currentTab === 'overview' && (
                <div className="tab-panel">
                  <h3>Overview</h3>
                  <p>{product.desc}</p>
                </div>
              )}
              {currentTab === 'specs' && (
                <div className="tab-panel">
                  <h3>Specifications</h3>
                  <pre className="specs-list">{product.specs}</pre>
                </div>
              )}
              {currentTab === 'reviews' && (
                <div className="tab-panel">
                  <h3>Customer Reviews</h3>
                  <pre className="reviews-list">{product.reviews}</pre>
                </div>
              )}
              {(currentTab === 'raw-pushstate-demo' ||
                currentTab === 'raw-replacestate-demo') && (
                <div className="tab-panel">
                  <h3>Raw History Demo Tab</h3>
                  <p>
                    Current tab from URL: <code>{currentTab}</code>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="raw-history-demo">
            <span className="scen-label">
              Scenario 2: Native pushState &amp; replaceState Interception
            </span>
            <p>
              Bypass React Router and fire raw History API calls. Monkey-patched
              listeners should intercept and log them.
            </p>
            <div className="btn-group">
              <button
                type="button"
                onClick={triggerRawPushState}
                className="btn btn-outline btn-raw"
              >
                Native pushState()
              </button>
              <button
                type="button"
                onClick={triggerRawReplaceState}
                className="btn btn-outline btn-raw"
              >
                Native replaceState()
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductDetail;
