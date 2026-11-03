import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <ShieldAlert size={44} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Access Restricted
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            This page is for <strong>{allowedRoles.join(' or ')}</strong> accounts. You are currently logged in as a <strong>{user.role}</strong>.
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
