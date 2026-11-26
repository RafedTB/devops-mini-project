import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { Product, Favorite } from '../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [addedId, setAddedId] = useState<number | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Create product form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formError, setFormError] = useState('');

  // Edit product state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const fetchProducts = async (name?: string) => {
    setLoading(true);
    try {
      const query = name ? `?name=${encodeURIComponent(name)}` : '';
      const data = await apiFetch<Product[]>(`/products${query}`);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const favs = await apiFetch<Favorite[]>('/favorites');
      const ids = new Set(favs.map((f) => f.product?.id).filter(Boolean));
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds(new Set());
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const toggleFavorite = async (productId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFav = favoriteIds.has(productId);
    // Optimistic UI update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      if (isFav) {
        await apiFetch(`/favorites/${productId}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/favorites/${productId}`, { method: 'POST' });
      }
    } catch {
      // Revert if failed
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({ name: formName, description: formDesc, price: Number(formPrice) }),
      });
      setShowForm(false);
      setFormName('');
      setFormDesc('');
      setFormPrice('');
      fetchProducts();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditPrice(String(p.price));
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    try {
      await apiFetch(`/products/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName, description: editDesc, price: Number(editPrice) }),
      });
      setEditId(null);
      fetchProducts();
    } catch {
      alert('Failed to update product');
    }
  };

  const isAdmin = user?.userType === 'admin';

  const [priceFilter, setPriceFilter] = useState<'all' | 'under50' | '50to100' | 'over100'>('all');

  const filteredProducts = products.filter((p) => {
    const price = Number(p.price);
    if (priceFilter === 'under50') return price < 50;
    if (priceFilter === '50to100') return price >= 50 && price <= 100;
    if (priceFilter === 'over100') return price > 100;
    return true;
  });

  return (
    <div className="store-catalog-wrapper">
      {/* E-Commerce Hero Showcase */}
      <section className="store-hero-banner">
        <div className="hero-content">
          <span className="hero-tag">Official Tech &amp; Developer Catalog</span>
          <h1 className="hero-heading">Engineered for Performance &amp; Productivity</h1>
          <p className="hero-subtext">
            Explore authentic developer hardware, workspace essentials, and premium accessories with verified reviews and instant delivery.
          </p>
          <div className="hero-perks">
            <div className="hero-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Free Shipping Over $50</span>
            </div>
            <div className="hero-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>2-Year Warranty</span>
            </div>
            <div className="hero-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>30-Day Money Back</span>
            </div>
          </div>
        </div>
      </section>

      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="catalog-count-label">Showing {filteredProducts.length} of {products.length} products</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Product'}
          </button>
        )}
      </div>

      <div className="catalog-toolbar">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search products by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${priceFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPriceFilter('all')}
          >
            All Prices
          </button>
          <button
            type="button"
            className={`filter-chip ${priceFilter === 'under50' ? 'active' : ''}`}
            onClick={() => setPriceFilter('under50')}
          >
            Under $50
          </button>
          <button
            type="button"
            className={`filter-chip ${priceFilter === '50to100' ? 'active' : ''}`}
            onClick={() => setPriceFilter('50to100')}
          >
            $50 &ndash; $100
          </button>
          <button
            type="button"
            className={`filter-chip ${priceFilter === 'over100' ? 'active' : ''}`}
            onClick={() => setPriceFilter('over100')}
          >
            $100+
          </button>
        </div>
      </div>

      {showForm && isAdmin && (
        <div className="form-container" style={{ marginBottom: '1.5rem' }}>
          <h3>Create Product</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleCreate}>
            <label>Name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            <label>Description</label>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} required />
            <label>Price</label>
            <input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading catalog products...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state-card">
          <h3>No products match your criteria</h3>
          <p>Try adjusting your search terms or clearing the active filters.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch('');
              setPriceFilter('all');
              fetchProducts();
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) =>
            editId === p.id ? (
              <div key={p.id} className="product-card">
                <form onSubmit={handleEdit}>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required />
                  <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
                  <div className="card-actions">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div key={p.id} className="product-card">
                <div className="product-card-preview">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="product-card-icon">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span className="product-badge-catalog">In Stock</span>
                </div>
                <div className="card-top-row">
                  <h3><Link to={`/products/${p.id}`}>{p.name}</Link></h3>
                  <button
                    type="button"
                    className={`btn-icon-favorite ${favoriteIds.has(p.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(p.id)}
                    title={favoriteIds.has(p.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={favoriteIds.has(p.id) ? '#2563eb' : 'none'}
                      stroke={favoriteIds.has(p.id) ? '#2563eb' : '#64748b'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
                <p className="product-price">${Number(p.price).toFixed(2)}</p>
                <p className="product-desc">{p.description}</p>
                <div className="card-actions">
                  <button
                    type="button"
                    className={`btn ${addedId === p.id ? 'btn-success' : 'btn-primary'} btn-sm`}
                    onClick={() => handleAddToCart(p)}
                  >
                    {addedId === p.id ? 'Added' : 'Add to Cart'}
                  </button>
                  <Link to={`/products/${p.id}`} className="btn btn-secondary btn-sm">View</Link>
                  {isAdmin && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
