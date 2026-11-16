import React, { useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS, getProductById, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { announceSmartechPage } from '../smartechPage';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const { addItem } = useCart();

  const product = getProductById(id) || PRODUCTS[0];

  useEffect(() => {
    announceSmartechPage('product display page');
  }, [id]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleAddToCart = () => {
    addItem(product);
    navigate('/cart');
  };

  return (
    <div className="page-container products-page">
      <nav className="breadcrumb">
        <Link to="/products">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="pdp-layout">
        <div className="pdp-media">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="pdp-summary">
          <span className="product-card-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price">{formatPrice(product.price)}</p>
          <p className="product-desc">{product.desc}</p>
          <div className="btn-group">
            <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
              Add to cart
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addItem(product)}
            >
              Add & keep shopping
            </button>
          </div>

          <div className="tabs-container">
            <div className="tabs-header">
              {['overview', 'specs', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab-btn ${currentTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {currentTab === 'overview' && <p>{product.desc}</p>}
              {currentTab === 'specs' && <pre className="specs-list">{product.specs}</pre>}
              {currentTab === 'reviews' && (
                <pre className="reviews-list">{product.reviews}</pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="related-rail">
        <h2>More products</h2>
        <div className="related-list">
          {PRODUCTS.filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((prod) => (
              <Link key={prod.id} to={`/products/${prod.id}`} className="related-link">
                <img src={prod.image} alt="" />
                <div>
                  <strong>{prod.name}</strong>
                  <span>{formatPrice(prod.price)}</span>
                </div>
              </Link>
            ))}
        </div>
      </aside>
    </div>
  );
}

export default ProductDetail;
