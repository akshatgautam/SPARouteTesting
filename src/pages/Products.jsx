import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';

const PRODUCTS_DATA = {
  1: { name: 'Quantum CPU Cooler', price: '$89.99', desc: 'Liquid cooling with addressable RGB and silent fans.', specs: 'Fan Speed: 2000 RPM, Noise: 18 dBA, Radiator: 240mm', reviews: '5★ - Extremely quiet!\n4★ - Fits well but manual is brief.' },
  2: { name: 'Nebula Mechanical Keyboard', price: '$149.50', desc: 'Hot-swappable linear switches with gasket mount design.', specs: 'Switches: Gateron Yellow, Keycaps: PBT dye-sub, Layout: 75%', reviews: '5★ - Smooth as butter.\n5★ - Amazing build quality.' },
  3: { name: 'Titan Gaming Mouse', price: '$79.00', desc: 'Ultra-lightweight wireless mouse with optical switches.', specs: 'Weight: 59g, Sensor: 26K DPI, Battery: 80 hours', reviews: '4★ - Super light, fits medium hands well.\n3★ - Scroll wheel got squeaky.' }
};

export function Products() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const product = PRODUCTS_DATA[id] || PRODUCTS_DATA[1];

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Trigger explicit/raw History API calls to demonstrate monkey-patching interception
  const triggerRawPushState = () => {
    const customUrl = `#/products/${id}?tab=raw-pushstate-demo`;
    window.history.pushState(
      { demo: 'pushState', timestamp: Date.now() },
      'Raw pushState Demo',
      customUrl
    );
  };

  const triggerRawReplaceState = () => {
    const customUrl = `#/products/${id}?tab=raw-replacestate-demo`;
    window.history.replaceState(
      { demo: 'replaceState', timestamp: Date.now() },
      'Raw replaceState Demo',
      customUrl
    );
  };

  return (
    <div className="page-container products-page">
      <header className="page-header">
        <h1>Dynamic Routes & Query Params</h1>
        <p className="subtitle">
          Demonstrate dynamic parameter tracking and query string mutations, alongside raw History API interception.
        </p>
      </header>

      <div className="grid grid-sidebar">
        {/* Product selector sidebar */}
        <aside className="sidebar-cards">
          <h3>Select Product</h3>
          <span className="scen-label">Scenario 5: Dynamic Route Param (:id)</span>
          <div className="sidebar-nav">
            {Object.entries(PRODUCTS_DATA).map(([prodId, prod]) => (
              <Link 
                key={prodId}
                to={`/products/${prodId}?tab=${currentTab}`}
                className={`sidebar-link ${id === prodId ? 'active' : ''}`}
              >
                <div className="sidebar-link-title">{prod.name}</div>
                <div className="sidebar-link-price">{prod.price}</div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Product display */}
        <main className="product-display glass-card">
          <div className="product-info-header">
            <h2>{product.name}</h2>
            <div className="product-price">{product.price}</div>
          </div>
          <p className="product-desc">{product.desc}</p>

          {/* Scenario 6: Query Parameter Tabs */}
          <div className="tabs-container">
            <span className="scen-label">Scenario 6: Query Param (?tab=)</span>
            <div className="tabs-header">
              <button 
                className={`tab-btn ${currentTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-btn ${currentTab === 'specs' ? 'active' : ''}`}
                onClick={() => handleTabChange('specs')}
              >
                Specifications
              </button>
              <button 
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
                  <p className="specs-list">{product.specs}</p>
                </div>
              )}
              {currentTab === 'reviews' && (
                <div className="tab-panel">
                  <h3>Customer Reviews</h3>
                  <pre className="reviews-list">{product.reviews}</pre>
                </div>
              )}
            </div>
          </div>

          <div className="spacer-sm"></div>

          {/* Scenario 2: Explicit pushState / replaceState */}
          <div className="raw-history-demo">
            <span className="scen-label">Scenario 2: Native pushState & replaceState Interception</span>
            <p>
              Click these buttons to bypass React Router and trigger raw History API calls directly. The monkey-patched listeners will intercept and log them.
            </p>
            <div className="btn-group">
              <button onClick={triggerRawPushState} className="btn btn-outline btn-raw">
                Native pushState()
              </button>
              <button onClick={triggerRawReplaceState} className="btn btn-outline btn-raw">
                Native replaceState()
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Products;
