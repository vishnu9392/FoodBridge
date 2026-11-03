import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" style={{ backgroundColor: '#0e0e11', borderTop: '1px solid var(--border-subtle)', padding: '3rem 0 2rem' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <Link to="/" className="brand-logo" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
              <div className="brand-icon-wrapper">
                <UtensilsCrossed size={18} />
              </div>
              <span>Food<span className="brand-accent">Bridge</span></span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              Smart Food Waste Reduction Platform connecting surplus food directly with people and relief shelters in need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem' }}>
              <li>
                <Link to="/available-food" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Available Food
                </Link>
              </li>
              <li>
                <Link to="/donate" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Donate Food
                </Link>
              </li>
              <li>
                <Link to="/expiry-detection" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Expiry Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Account
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem' }}>
              <li>
                <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  User Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}
        >
          <ShieldAlert size={16} style={{ color: 'var(--soon-yellow)', flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Food Safety Notice:</strong> Expiry indicators are date-based estimates to prioritize collection. Always perform standard sensory inspection (visual, smell, temperature) before consumption.
          </span>
        </div>

        {/* Copyright */}
        <div
          style={{
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>© {new Date().getFullYear()} FoodBridge. All rights reserved.</span>
          <span>Connecting surplus food with communities.</span>
        </div>
      </div>
    </footer>
  );
};
