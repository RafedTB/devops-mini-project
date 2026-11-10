import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { apiFetch } from '../api';
import { Order } from '../types';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.username || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!fullName.trim() || !address.trim() || !city.trim() || !postalCode.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all delivery details.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        fullName: fullName.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const order = await apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      clearCart();
      setConfirmedOrder(order);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to confirm order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Order confirmation screen after successful purchase
  if (confirmedOrder) {
    return (
      <div className="order-confirmed-wrapper">
        <div className="order-confirmed-card">
          <div className="confirmation-icon-wrapper">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Order Confirmed!</h2>
          <p className="order-ref">Order Reference: <strong>#{confirmedOrder.id}</strong></p>
          <p className="order-status-badge">Status: {confirmedOrder.status}</p>

          <div className="confirmed-delivery-box">
            <h4>Delivery Address</h4>
            <p><strong>{confirmedOrder.fullName}</strong></p>
            <p>{confirmedOrder.address}</p>
            <p>{confirmedOrder.city}, {confirmedOrder.postalCode}</p>
            <p>Phone: {confirmedOrder.phone}</p>
          </div>

          <div className="confirmed-items-box">
            <h4>Order Summary</h4>
            {confirmedOrder.items?.map((item) => (
              <div key={item.id} className="confirmed-item-row">
                <span>{item.productName} &times; {item.quantity}</span>
                <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="confirmed-total-row">
              <strong>Total Paid</strong>
              <strong>${Number(confirmedOrder.totalPrice).toFixed(2)}</strong>
            </div>
          </div>

          <div className="confirmed-actions">
            <Link to="/orders" className="btn btn-secondary">
              View My Orders
            </Link>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty cart state
  if (items.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <Link to="/" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Products</span>
        </Link>

        <div className="empty-state-card">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h3>Your Shopping Cart is Empty</h3>
          <p>You haven't added any items to your cart yet. Explore our products and add what you need!</p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 3. Cart items + Delivery form
  return (
    <div className="cart-page-wrapper">
      <Link to="/" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Products</span>
      </Link>

      <div className="page-header">
        <h2>Shopping Cart &amp; Checkout</h2>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      <div className="checkout-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-items-section">
          <h3>Your Items ({items.length})</h3>

          <div className="cart-items-list">
            {items.map(({ product, quantity }) => {
              const lineTotal = Number(product.price) * quantity;
              return (
                <div key={product.id} className="cart-item-card">
                  <div className="cart-item-info">
                    <h4>
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h4>
                    <p className="cart-item-unit-price">${Number(product.price).toFixed(2)} each</p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="stepper-btn"
                        title="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className="stepper-value">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="stepper-btn"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      ${lineTotal.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="btn-remove-item"
                      title="Remove item"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-subbox">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="summary-row summary-total">
              <strong>Order Total</strong>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Details & Confirm Form */}
        <div className="delivery-section">
          <form onSubmit={handleConfirmOrder} className="delivery-form-card">
            <h3>Delivery Information</h3>
            <p className="delivery-note">Complete your delivery address to confirm the order.</p>

            <div className="profile-form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Receiver full name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="address">Delivery Address</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, building, apartment"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="profile-form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="ZIP / Postal code"
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-confirm-order"
              disabled={submitting}
            >
              {submitting ? 'Confirming Order...' : `Confirm Order ($${totalPrice.toFixed(2)})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

