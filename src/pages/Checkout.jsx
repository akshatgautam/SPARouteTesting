import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { announceSmartechPage } from '../smartechPage';

const INITIAL = {
  name: 'Akshat Gautam',
  email: 'akshat@testmail.com',
  address: '12 Market Street',
  city: 'Bengaluru',
  postal: '560001',
};

export function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, placeOrder } = useCart();
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const placingOrderRef = useRef(false);

  useEffect(() => {
    announceSmartechPage('checkout page');
  }, []);

  // Redirect empty cart away — skip while placing so placeOrder's cart
  // clear does not race the confirmation navigation.
  useEffect(() => {
    if (placingOrderRef.current || submitting) return;
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate, submitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0 || submitting || placingOrderRef.current) return;

    placingOrderRef.current = true;
    setSubmitting(true);
    // Mock successful purchase
    const order = placeOrder(form);
    navigate(`/order-confirmation?order=${encodeURIComponent(order.id)}`, {
      replace: true,
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="page-container checkout-page">
      <header className="page-header">
        <h1>Checkout</h1>
        <p className="subtitle">Enter shipping details to place a mock order.</p>
      </header>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping</h2>
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Address
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              autoComplete="street-address"
            />
          </label>
          <div className="form-row">
            <label>
              City
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                autoComplete="address-level2"
              />
            </label>
            <label>
              Postal code
              <input
                name="postal"
                value={form.postal}
                onChange={handleChange}
                required
                autoComplete="postal-code"
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <Link to="/cart" className="text-link">
            Back to cart
          </Link>
        </form>

        <aside className="cart-summary">
          <h2>Your order</h2>
          <ul className="checkout-items">
            {items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>Free</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
