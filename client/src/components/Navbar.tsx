import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut, Menu, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isDonor, isRecipient, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 900, backgroundColor: 'rgba(18, 18, 18, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div className="brand-icon-wrapper" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', color: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UtensilsCrossed size={18} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Food<span style={{ color: 'var(--primary)' }}>Bridge</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/available-food" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Available Food
            </NavLink>
          </li>

          {/* Logged-out visitor links */}
          {!isAuthenticated && (
            <li>
              <NavLink to="/expiry-detection" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Expiry Intelligence
              </NavLink>
            </li>
          )}

          {/* Logged-in Donor navigation */}
          {isAuthenticated && isDonor && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/donate" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Donate Food
                </NavLink>
              </li>
              <li>
                <NavLink to="/pickups" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Pickup Management
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Profile
                </NavLink>
              </li>
            </>
          )}

          {/* Logged-in Recipient navigation */}
          {isAuthenticated && isRecipient && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/pickups" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Pickups
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Profile
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Right side Actions */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isDonor && (
                <Link to="/donate" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                  <PlusCircle size={15} />
                  <span>Donate</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                aria-label="Log Out"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.35rem',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer open"
          style={{
            backgroundColor: '#161619',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <Link to="/" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
            Home
          </Link>
          <Link to="/available-food" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
            Available Food
          </Link>

          {!isAuthenticated && (
            <>
              <Link to="/expiry-detection" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Expiry Intelligence
              </Link>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMenu} style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu} style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                  Register
                </Link>
              </div>
            </>
          )}

          {isAuthenticated && isDonor && (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Dashboard
              </Link>
              <Link to="/donate" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Donate Food
              </Link>
              <Link to="/pickups" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Pickup Management
              </Link>
              <Link to="/profile" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                Logout
              </button>
            </>
          )}

          {isAuthenticated && isRecipient && (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Dashboard
              </Link>
              <Link to="/pickups" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                My Pickups
              </Link>
              <Link to="/profile" className="nav-link" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
