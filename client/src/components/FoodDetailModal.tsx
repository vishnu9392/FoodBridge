import React from 'react';
import { X, MapPin, Calendar, Clock, Utensils, ArrowRight, ShieldCheck } from 'lucide-react';
import { Donation } from '../types';
import { ExpiryBadge } from './ExpiryBadge';
import { MapPreview } from './MapPreview';

interface FoodDetailModalProps {
  donation: Donation | null;
  onClose: () => void;
  onRequestPickup?: (donation: Donation) => void;
  isOwner?: boolean;
  canRequestPickup?: boolean;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  donation,
  onClose,
  onRequestPickup,
  isOwner = false,
  canRequestPickup,
}) => {
  if (!donation) return null;

  const isAvailable = donation.status === 'available';
  const isExpired = donation.expiryStatus === 'expired';
  const displayQuantity =
    donation.availableQuantity !== undefined
      ? donation.availableQuantity
      : donation.quantity;

  const canRequest =
    canRequestPickup !== undefined
      ? canRequestPickup && isAvailable && !isExpired
      : isAvailable && !isExpired && !isOwner;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content animate-scale-in"
        style={{
          maxWidth: '580px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#161616',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Food Title and Close button */}
        <div
          className="modal-header"
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Surplus Food Details
            </span>
            <h3
              style={{
                fontSize: '1.35rem',
                margin: 0,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {donation.foodName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
            style={{ borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="modal-body custom-scrollbar"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* 1. Food Image with Category & Expiry Badge overlay */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              height: '210px',
              backgroundColor: '#1E1E1E',
            }}
          >
            <img
              src={
                donation.imageUrl ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
              }
              alt={donation.foodName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <ExpiryBadge
                status={donation.expiryStatus}
                timeRemaining={donation.timeRemaining?.humanReadable}
              />
            </div>
            <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(18, 18, 18, 0.88)',
                  backdropFilter: 'blur(6px)',
                  color: 'var(--text-main)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {donation.category}
              </span>
            </div>
          </div>

          {/* 2. Short Description */}
          {donation.description && (
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              {donation.description}
            </p>
          )}

          {/* 3. Essential Metrics Grid: Quantity, Expiry, Prep */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              backgroundColor: '#1E1E1E',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Quantity</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginTop: '0.2rem',
                }}
              >
                <Utensils size={15} />
                <span>
                  {displayQuantity} {donation.unit}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prepared On</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  marginTop: '0.2rem',
                }}
              >
                <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                <span>{new Date(donation.prepDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expires By</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  marginTop: '0.2rem',
                }}
              >
                <Clock size={13} style={{ color: 'var(--soon-yellow)' }} />
                <span>{new Date(donation.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* 4. Dietary & Allergen Information */}
          {donation.dietaryInfo && donation.dietaryInfo.length > 0 && (
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Dietary & Allergen Information:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {donation.dietaryInfo.map((info, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255, 140, 66, 0.1)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(255, 140, 66, 0.25)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                    }}
                  >
                    {info}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Pickup Location & Google Maps Preview */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <MapPin size={15} style={{ color: 'var(--primary)' }} />
                <span>Pickup Location</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {donation.isAuthorizedContact ? 'Exact Pickup Address' : 'Locality & Direction Preview'}
              </span>
            </div>

            <MapPreview
              location={donation.location}
              title={donation.foodName}
              isExact={Boolean(donation.isAuthorizedContact)}
            />
          </div>

          {/* Privacy Note */}
          {!donation.isAuthorizedContact && !isOwner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <ShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>
                To protect donor privacy, exact street address and phone details are provided once your pickup request is approved.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer with Prominent Request Pickup Button */}
        <div
          className="modal-footer"
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
            Close
          </button>

          {canRequest && onRequestPickup && (
            <button
              onClick={() => {
                onClose();
                onRequestPickup(donation);
              }}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.75rem',
                fontSize: '0.96rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Request Pickup</span>
              <ArrowRight size={16} />
            </button>
          )}

          {isOwner && (
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 500,
                padding: '0.4rem 0.75rem',
              }}
            >
              (Your Donation Listing)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
