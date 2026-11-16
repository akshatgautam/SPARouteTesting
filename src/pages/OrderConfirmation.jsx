import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { announceSmartechPage } from '../smartechPage';

export function OrderConfirmation() {
  const { lastOrder } = useCart();

  useEffect(() => {
    announceSmartechPage('order confirmation page');
  }, []);

  if (!lastOrder) {
    return (
      <div className="page-container">
        <header className="page-header">
          <h1>No order found</h1>
          <p className="subtitle">Place a mock order from checkout to see confirmation.</p>
        </header>
        <Link to="/products" className="btn btn-primary">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container confirmation-page">
      <header className="page-header confirmation-header">
        <p className="eyebrow success">Order placed</p>
        <h1>Thanks, {lastOrder.customer.name.split(' ')[0]}</h1>
        <p className="subtitle">
          Your mock purchase went through. Confirmation #{lastOrder.id}.
        </p>
      </header>

      <div className="confirmation-card">
        <div className="summary-row">
          <span>Order ID</span>
          <strong>{lastOrder.id}</strong>
        </div>
        <div className="summary-row">
          <span>Email</span>
          <strong>{lastOrder.customer.email}</strong>
        </div>
        <div className="summary-row">
          <span>Ship to</span>
          <strong>
            {lastOrder.customer.address}, {lastOrder.customer.city}{' '}
            {lastOrder.customer.postal}
          </strong>
        </div>

        <h2>Items</h2>
        <ul className="checkout-items">
          {lastOrder.items.map((item) => (
            <li key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="summary-row total">
          <span>Total paid</span>
          <strong>{formatPrice(lastOrder.subtotal)}</strong>
        </div>
      </div>

      <div className="btn-group">
        <Link to="/products" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link to="/" className="btn btn-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
