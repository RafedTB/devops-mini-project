import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Avatar from '../Avatar';

export default function ProfilePage() {
  const { user, loading, updateProfile, uploadProfileImage, removeProfileImage } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      setUsername(user.username || '');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="profile-page-wrapper">
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    try {
      setSaving(true);
      const payload: { username?: string; password?: string } = {
        username: username.trim(),
      };
      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('Profile updated successfully.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be 2MB or less.');
      return;
    }

    // Generate local preview immediately for great UX
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setUploadingImage(true);
      setErrorMsg(null);
      await uploadProfileImage(file);
      setSuccessMsg('Profile photo updated.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to upload photo.');
      setPreviewUrl(null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!user.profileImage && !previewUrl) return;
    try {
      setUploadingImage(true);
      setErrorMsg(null);
      setPreviewUrl(null);
      await removeProfileImage();
      setSuccessMsg('Profile photo removed.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to remove photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const displayName = user.username || user.email || 'User';

  return (
    <div className="profile-page-wrapper">
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

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <Avatar
              imageFilename={user.profileImage}
              name={displayName}
              previewUrl={previewUrl}
              className="profile-avatar-large"
              fallbackClassName="profile-avatar-fallback-large"
            />
            <div className="avatar-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Uploading...' : (user.profileImage || previewUrl) ? 'Change Photo' : 'Upload Photo'}
              </button>
              {(user.profileImage || previewUrl) && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <div className="profile-header-info">
            <h2>{user.username || 'User Profile'}</h2>
            <p className="profile-email">{user.email}</p>
            <div className="profile-badges">
              <span className={`badge ${user.userType === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user.userType === 'admin' ? 'Admin' : 'Customer'}
              </span>
              <span className={`badge ${user.isAccountVerified ? 'badge-verified' : 'badge-unverified'}`}>
                {user.isAccountVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <hr className="profile-divider" />

        <form onSubmit={handleUpdateProfile} className="profile-form">
          <h3>Edit Profile Information</h3>

          <div className="profile-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="input-disabled"
            />
            <small className="field-hint">Email address is managed by the system and cannot be edited.</small>
          </div>

          <div className="profile-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className="profile-form-section-title">
            <h4>Change Password</h4>
            <p className="section-subtitle">Leave empty if you do not want to change your password.</p>
          </div>

          <div className="profile-form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              minLength={6}
              maxLength={50}
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
              maxLength={50}
            />
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
