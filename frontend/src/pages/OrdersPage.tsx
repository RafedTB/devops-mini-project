import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../AuthContext';
import { Order } from '../types';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Order[]>('/orders');
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="container">
        <p className="loading-text">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <Link to="/" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Products</span>
      </Link>

      <div className="page-header">
        <h2>My Orders</h2>
        <p className="section-subtitle">{orders.length} placed {orders.length === 1 ? 'order' : 'orders'}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
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
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <h3>No Orders Yet</h3>
          <p>When you complete a purchase, your order history and delivery details will appear here.</p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            return (
              <div key={order.id} className="order-history-card">
                <div className="order-history-header">
                  <div>
                    <span className="order-history-id">Order #{order.id}</span>
                    <span className="order-history-date">{formattedDate}</span>
                  </div>
                  <div className="order-header-right">
                    <span className="badge badge-verified">{order.status}</span>
                    <strong className="order-history-total">${Number(order.totalPrice).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="order-history-delivery">
                  <strong>Delivered to:</strong> {order.fullName} &bull; {order.address}, {order.city} ({order.postalCode}) &bull; Tel: {order.phone}
                </div>

                <div className="order-history-items">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-history-item-row">
                      <span>{item.productName} &times; {item.quantity}</span>
                      <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

