import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, UserPlus, HeartHandshake, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'recipient'>('donor');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setFormError('Please enter a valid contact phone number.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        organization: organization.trim(),
        address: address.trim(),
      });
      navigate('/dashboard');
    } catch {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        className="auth-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Join FoodBridge
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Create an account to start donating or receiving surplus food.
          </p>
        </div>

        {(formError || error) && (
          <div
            style={{
              backgroundColor: 'rgba(231, 76, 60, 0.12)',
              border: '1px solid var(--expired-red)',
              color: '#FFB3BA',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Role Selector with Radio Buttons */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              I am registering as: *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: role === 'donor' ? 'var(--primary-subtle)' : 'var(--bg-input)',
                  border: role === 'donor' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="userRole"
                  value="donor"
                  checked={role === 'donor'}
                  onChange={() => setRole('donor')}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                    Food Donor
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Share surplus food
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: role === 'recipient' ? 'var(--primary-subtle)' : 'var(--bg-input)',
                  border: role === 'recipient' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="userRole"
                  value="recipient"
                  checked={role === 'recipient'}
                  onChange={() => setRole('recipient')}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                    Recipient
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Find & collect food
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="registerName" style={{ fontSize: '0.88rem' }}>
              Full Name *
            </label>
            <input
              id="registerName"
              type="text"
              required
              className="form-input"
              placeholder="e.g., Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email & Phone Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="registerEmail" style={{ fontSize: '0.88rem' }}>
                Email Address *
              </label>
              <input
                id="registerEmail"
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="registerPhone" style={{ fontSize: '0.88rem' }}>
                Phone Number *
              </label>
              <input
                id="registerPhone"
                type="tel"
                required
                className="form-input"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Organization & City Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="registerOrg" style={{ fontSize: '0.88rem' }}>
                Organization Name <span className="form-hint">(Optional)</span>
              </label>
              <input
                id="registerOrg"
                type="text"
                className="form-input"
                placeholder="e.g., Downtown Kitchen"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="registerCity" style={{ fontSize: '0.88rem' }}>
                City / Location <span className="form-hint">(Optional)</span>
              </label>
              <input
                id="registerCity"
                type="text"
                className="form-input"
                placeholder="e.g., Metro City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="registerPassword" style={{ fontSize: '0.88rem' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="registerPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="confirmPassword" style={{ fontSize: '0.88rem' }}>
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              padding: '0.75rem',
              marginTop: '0.5rem',
            }}
            disabled={submitting}
          >
            {submitting ? (
              <span>Registering...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
