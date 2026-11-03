import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fromLocation =
    typeof (location.state as any)?.from === 'string'
      ? (location.state as any).from
      : (location.state as any)?.from?.pathname || null;
  const redirectNotice = (location.state as any)?.message || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      if (fromLocation) {
        navigate(fromLocation, { replace: true });
      } else {
        navigate('/dashboard');
      }
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
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 className="heading-serif" style={{ fontSize: '2.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Sign in to manage surplus donations and community food pickups.
          </p>
        </div>

        {redirectNotice && (
          <div
            style={{
              backgroundColor: 'rgba(255, 140, 66, 0.12)',
              border: '1px solid var(--primary)',
              color: '#FFE0B2',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
            }}
          >
            {redirectNotice}
          </div>
        )}

        {(formError || error) && (
          <div
            style={{
              backgroundColor: 'rgba(255, 77, 99, 0.12)',
              border: '1px solid var(--expired-red)',
              color: '#FFB3BA',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
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
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="loginEmail" style={{ fontSize: '0.88rem' }}>
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="name@organization.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="loginPassword" style={{ fontSize: '0.88rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Enter your password"
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
                  padding: '0.2rem',
                }}
                aria-label="Toggle password view"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="form-checkbox-label" style={{ fontSize: '0.86rem' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
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
              padding: '0.8rem',
            }}
            disabled={submitting}
          >
            {submitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
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
          <span>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
