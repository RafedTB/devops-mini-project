import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { Product, Review } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = async () => {
    try {
      const data = await apiFetch<Product>(`/products/${id}`);
      setProduct(data);
    } catch {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !id) {
      setIsFavorite(false);
      return;
    }
    try {
      const res = await apiFetch<{ isFavorite: boolean }>(`/favorites/check/${id}`);
      setIsFavorite(res.isFavorite);
    } catch {
      setIsFavorite(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    checkFavorite();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      if (nextState) {
        await apiFetch(`/favorites/${id}`, { method: 'POST' });
      } else {
        await apiFetch(`/favorites/${id}`, { method: 'DELETE' });
      }
    } catch {
      setIsFavorite(!nextState);
    }
  };

  const handleReview = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      await apiFetch(`/reviews/${id}`, {
        method: 'POST',
        body: JSON.stringify({ rating: Number(rating), comment }),
      });
      setComment('');
      setRating(5);
      fetchProduct();
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Delete this review?')) return;
    try {
      await apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
      fetchProduct();
    } catch {
      alert('Failed to delete review');
    }
  };

  const getReviewUserId = (review: Review): number | null => {
    if (!review.user) return null;
    if (typeof review.user === 'number') return review.user;
    return review.user.id;
  };

  const getReviewUsername = (review: Review): string => {
    if (!review.user) return 'Anonymous';
    if (typeof review.user === 'number') return `User #${review.user}`;
    return review.user.username || 'User';
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="alert alert-error">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const canDeleteReview = (r: Review) => {
    if (!user) return false;
    if (user.userType === 'admin') return true;
    const authorId = getReviewUserId(r);
    return authorId !== null && user.id === authorId;
  };

  return (
    <div>
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
      <div className="product-detail">
        <div className="product-detail-layout">
          {/* Left Column: Visual Product Showcase */}
          <div className="product-detail-gallery">
            <div className="product-gallery-main">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="gallery-main-icon">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <div className="gallery-badges">
                <span className="gallery-badge-stock">In Stock &bull; Ships Today</span>
                <span className="gallery-badge-delivery">Free Express Delivery</span>
              </div>
            </div>
            <div className="gallery-features-strip">
              <div className="gallery-feature-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>2-Year Full Coverage</span>
              </div>
              <div className="gallery-feature-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>30-Day Free Returns</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Actions */}
          <div className="product-detail-info">
            <div className="product-detail-header">
              <div>
                <span className="product-sku-tag">SKU: PROD-{product.id.toString().padStart(4, '0')}</span>
                <h2>{product.name}</h2>
                <p className="product-price">${Number(product.price).toFixed(2)}</p>
              </div>
              {user && (
                <button
                  type="button"
                  className={`btn ${isFavorite ? 'btn-primary' : 'btn-secondary'} btn-sm wishlist-toggle-btn`}
                  onClick={handleToggleFavorite}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{isFavorite ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>
              )}
            </div>

            <p className="product-desc-detail">{product.description}</p>

            <div className="product-trust-callout">
              <div className="trust-callout-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>Instant Dispatch:</strong> Order within 2 hours for today's pickup</span>
              </div>
              <div className="trust-callout-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>Authenticity:</strong> 100% verified developer hardware</span>
              </div>
            </div>

            {/* Purchase & Add to Cart Controls */}
            <div className="detail-cart-section">
              <div className="detail-quantity-controls">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    &minus;
                  </button>
                  <span className="stepper-value">{quantity}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-add-cart-detail"
                onClick={() => {
                  addToCart(product, quantity);
                  setAddedNotice(true);
                  setTimeout(() => setAddedNotice(false), 2000);
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>{addedNotice ? 'Added to Cart!' : `Add to Cart ($${(Number(product.price) * quantity).toFixed(2)})`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Reviews</h3>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="reviews-list">
            {product.reviews.map((r: Review) => {
              const safeRating = Math.max(0, Math.min(5, Math.floor(r.rating || 0)));
              return (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <strong>{getReviewUsername(r)}</strong>
                    <span className="review-rating">{'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}</span>
                  </div>
                  <p>{r.comment}</p>
                  {canDeleteReview(r) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReview(r.id)}>Delete</button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}

        {user ? (
          <div className="form-container" style={{ marginTop: '1.5rem' }}>
            <h4>Leave a Review</h4>
            {reviewError && <div className="alert alert-error">{reviewError}</div>}
            <form onSubmit={handleReview}>
              <label>Rating</label>
              <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Terrible</option>
              </select>
              <label>Comment</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                required
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <p style={{ marginTop: '1rem' }}>
            <Link to="/login">Log in</Link> to leave a review.
          </p>
        )}
      </div>
    </div>
  );
}
