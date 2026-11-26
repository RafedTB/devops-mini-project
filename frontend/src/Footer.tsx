import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>NestStore</span>
            </div>
            <p className="footer-desc">
              Your premier e-commerce destination for curated developer hardware, productivity essentials, and tech accessories.
            </p>
            <div className="trust-badges">
              <span className="trust-pill">SSL Secured</span>
              <span className="trust-pill">Fast Shipping</span>
              <span className="trust-pill">30-Day Returns</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="footer-col">
            <h4>Shop &amp; Browse</h4>
            <ul>
              <li><Link to="/">All Products</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="footer-col">
            <h4>Account &amp; Security</h4>
            <ul>
              <li><Link to="/profile">Profile Settings</Link></li>
              <li><Link to="/login">Customer Login</Link></li>
              <li><Link to="/register">Create an Account</Link></li>
              <li><Link to="/orders">Track Delivery</Link></li>
            </ul>
          </div>

          {/* Guarantee / Perks */}
          <div className="footer-col">
            <h4>Customer Guarantee</h4>
            <div className="guarantee-list">
              <div className="guarantee-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div>
                  <strong>Free Delivery</strong>
                  <p>On all qualifying catalog orders</p>
                </div>
              </div>
              <div className="guarantee-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <strong>Buyer Protection</strong>
                  <p>100% money back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NestStore E-Commerce. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Terms of Service</span>
            <span>&bull;</span>
            <span>Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
