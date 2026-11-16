import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { announceSmartechPage } from '../smartechPage';

export function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();

  useEffect(() => {
    announceSmartechPage('cart page');
  }, []);

  return (
    <div className="page-container cart-page">
      <header className="page-header">
        <h1>Your cart</h1>
        <p className="subtitle">
          {items.length === 0
            ? 'Your bag is empty — pick something from the shop.'
            : `${items.length} line item${items.length === 1 ? '' : 's'} ready for checkout.`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="empty-state-block">
          <Link to="/products" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-lines">
            {items.map((item) => (
              <li key={item.id} className="cart-line">
                <img src={item.image} alt="" className="cart-line-thumb" />
                <div className="cart-line-info">
                  <Link to={`/products/${item.id}`}>{item.name}</Link>
                  <span>{formatPrice(item.price)}</span>
                  <div className="qty-control">
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
                <div className="cart-line-aside">
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="summary-row muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block">
              Proceed to checkout
            </Link>
            <button type="button" className="btn btn-ghost btn-block" onClick={clearCart}>
              Clear cart
            </button>
            <Link to="/products" className="text-link">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
