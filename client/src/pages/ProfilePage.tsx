import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  MapPin,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Shield,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentUser, logout } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        address: address.trim(),
        bio: bio.trim(),
      });
      if (res.success && res.user) {
        updateCurrentUser(res.user);
        setProfileSuccess('Profile details saved successfully.');
        setTimeout(() => setProfileSuccess(null), 4000);
      }
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setUpdatingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="container main-content" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Account & Profile Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your contact credentials, organization identity, and security parameters.
        </p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Avatar & Overview */}
        <div className="profile-card-left">
          <div className="profile-avatar-large">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {user?.email}
          </p>

          <span
            className="tag"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              padding: '0.35rem 0.85rem',
              backgroundColor: user?.role === 'donor' ? 'var(--primary-subtle)' : 'var(--fresh-bg)',
              color: user?.role === 'donor' ? 'var(--primary)' : 'var(--fresh-green)',
              marginBottom: '1.5rem',
            }}
          >
            Verified {user?.role}
          </span>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '0.5rem', textAlign: 'left', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Phone size={15} style={{ color: 'var(--primary)' }} />
              <span>{user?.phone || 'No phone set'}</span>
            </div>
            {user?.organization && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Building size={15} style={{ color: 'var(--primary)' }} />
                <span>{user.organization}</span>
              </div>
            )}
            {user?.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--primary)' }} />
                <span>{user.address}</span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginTop: '2rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Column: Edit Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* General Information Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>General Information</h3>

            {profileSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Organization / Hub Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. City Food Bank"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary City / Hub</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Metro Area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Mission Statement</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share details about your food kitchen or restaurant operations..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Security & Password Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} />
              <span>Change Password</span>
            </h3>

            {passwordSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={updatingPassword}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
