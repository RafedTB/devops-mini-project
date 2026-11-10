import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const displayName = user ? (user.username || user.email || 'User') : '';

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          DevOps Store
        </Link>
        <div className="nav-links">
          {/* Cart Link with Badge */}
          <Link to="/cart" className="nav-cart-btn" title="View Shopping Cart">
            <svg
              width="18"
              height="18"
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
            <span className="cart-label">Cart</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div
              className="profile-menu-container"
              ref={menuRef}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                className="profile-nav-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                title="Account menu"
              >
                <Avatar
                  imageFilename={user.profileImage}
                  name={displayName}
                  className="nav-avatar-img"
                  fallbackClassName="nav-avatar-fallback"
                />
                <span className="nav-user-name">
                  {user.username || user.email}
                </span>
                <svg
                  className={`dropdown-caret ${dropdownOpen ? 'rotated' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
                <div className="profile-dropdown-header">
                  <Avatar
                    imageFilename={user.profileImage}
                    name={displayName}
                    className="dropdown-avatar-img"
                    fallbackClassName="dropdown-avatar-fallback"
                  />
                  <div className="dropdown-user-details">
                    <div className="dropdown-username">{user.username || 'User'}</div>
                    <div className="dropdown-email">{user.email}</div>
                    <div className="dropdown-role-tag">
                      {user.userType === 'admin' ? 'Admin' : 'Customer'}
                    </div>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                <div className="profile-dropdown-items">
                  <Link
                    to="/wishlist"
                    className="dropdown-item wishlist-link-btn"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>My Wishlist</span>
                  </Link>

                  <Link
                    to="/orders"
                    className="dropdown-item orders-link-btn"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="dropdown-item profile-link-btn"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-btn"
                    type="button"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
