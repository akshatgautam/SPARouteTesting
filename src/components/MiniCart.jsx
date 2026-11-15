import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export function MiniCart() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        className={`minicart-backdrop ${isOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`minicart-drawer ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="minicart-header">
          <h2>Your Cart</h2>
          <button
            type="button"
            className="minicart-close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="minicart-body">
          {items.length === 0 ? (
            <div className="minicart-empty">
              <p>Your cart is empty.</p>
              <Link to="/products" className="btn btn-primary" onClick={closeCart}>
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="minicart-list">
              {items.map((item) => (
                <li key={item.id} className="minicart-item">
                  <img src={item.image} alt="" className="minicart-thumb" />
                  <div className="minicart-item-info">
                    <Link
                      to={`/products/${item.id}`}
                      onClick={closeCart}
                      className="minicart-item-name"
                    >
                      {item.name}
                    </Link>
                    <div className="minicart-item-price">
                      {formatPrice(item.price)}
                    </div>
                    <div className="minicart-qty">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="minicart-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="minicart-footer">
            <div className="minicart-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <button type="button" className="btn btn-primary btn-block">
              Checkout
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={clearCart}
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default MiniCart;
