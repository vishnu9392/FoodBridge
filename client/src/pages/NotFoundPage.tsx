import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container main-content" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '1.25rem', borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <UtensilsCrossed size={48} />
        </div>

        <h1 className="heading-serif" style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.8rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
          Plate Not Found
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          The page or food rescue listing you're looking for doesn't exist or has moved. Let's redirect you back to active surplus listings.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/available-food" className="btn btn-secondary">
            <Search size={16} /> Browse Food Listings
          </Link>
        </div>
      </div>
    </div>
  );
};
