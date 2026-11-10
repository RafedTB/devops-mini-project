import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../AuthContext';
import { Favorite } from '../types';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Favorite[]>('/favorites');
      setFavorites(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, navigate]);

  const handleRemove = async (productId: number) => {
    try {
      await apiFetch(`/favorites/${productId}`, { method: 'DELETE' });
      setFavorites((prev) => prev.filter((fav) => fav.product?.id !== productId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove from wishlist.');
    }
  };

  if (authLoading || (loading && favorites.length === 0)) {
    return (
      <div className="container">
        <p className="loading-text">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Link to="/" className="back-link">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Products</span>
      </Link>

      <div className="page-header">
        <div>
          <h2>My Wishlist</h2>
          <p className="section-subtitle">
            {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {favorites.length === 0 ? (
        <div className="empty-state-card">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h3>Your wishlist is empty</h3>
          <p>Explore our catalog and bookmark products you want to keep track of.</p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map((fav) => {
            const product = fav.product;
            if (!product) return null;
            return (
              <div key={fav.id} className="product-card">
                <div className="card-top-row">
                  <h3>
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                  <button
                    type="button"
                    className="btn-icon-remove"
                    onClick={() => handleRemove(product.id)}
                    title="Remove from wishlist"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <p className="product-price">${Number(product.price).toFixed(2)}</p>
                <p className="product-desc">{product.description}</p>
                <div className="card-actions">
                  <Link to={`/products/${product.id}`} className="btn btn-secondary btn-sm">
                    View Details
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

