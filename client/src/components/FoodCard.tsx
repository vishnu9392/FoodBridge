import React, { useState } from 'react';
import { MapPin, User as UserIcon, Calendar, ArrowRight, Utensils } from 'lucide-react';
import { Donation } from '../types';
import { ExpiryBadge } from './ExpiryBadge';

interface FoodCardProps {
  donation: Donation;
  onViewDetails?: (donation: Donation) => void;
  onRequestPickup?: (donation: Donation) => void;
  isOwner?: boolean;
}

const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

export const FoodCard: React.FC<FoodCardProps> = ({
  donation,
  onViewDetails,
  onRequestPickup,
  isOwner = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(donation.imageUrl || FALLBACK_FOOD_IMG);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_FOOD_IMG);
    }
  };

  const isAvailable = donation.status === 'available';
  const isExpired = donation.expiryStatus === 'expired';
  const displayQuantity =
    donation.availableQuantity !== undefined
      ? donation.availableQuantity
      : donation.quantity;
  const displayLocation = donation.location?.locality
    ? `${donation.location.locality}, ${donation.location.city}`
    : donation.location?.city || 'Local Area';

  return (
    <div className="food-card">
      <div className="food-card-img-wrapper">
        <img
          src={imgSrc}
          alt={donation.foodName}
          className="food-card-img"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="food-card-badge-overlay">
          <ExpiryBadge
            status={donation.expiryStatus}
            timeRemaining={donation.timeRemaining?.humanReadable}
          />
        </div>
        <div className="food-card-category-overlay">
          <span>{donation.category}</span>
        </div>
      </div>

      <div className="food-card-body">
        <h3 className="food-card-title">{donation.foodName}</h3>
        <p className="food-card-desc">
          {donation.description || 'Nutritious surplus food safely stored and packaged for community rescue.'}
        </p>

        <div className="food-card-meta">
          <div className="meta-row">
            <div className="meta-item" title="Available quantity">
              <Utensils size={14} style={{ color: 'var(--primary)' }} />
              <strong>{displayQuantity} {donation.unit} available</strong>
            </div>
            <div className="meta-item" title="Pickup locality or city">
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              <span>{displayLocation}</span>
            </div>
          </div>

          <div className="meta-row">
            <div className="meta-item" title={donation.donor?.name || 'Community Donor'}>
              <UserIcon size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{donation.donor?.name || 'Community Donor'}</span>
            </div>
            <div className="meta-item" title="Expiry date">
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{new Date(donation.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {donation.dietaryInfo && donation.dietaryInfo.length > 0 && (
          <div className="food-card-dietary">
            {donation.dietaryInfo.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
              </span>
            ))}
            {donation.dietaryInfo.length > 3 && (
              <span className="tag">+{donation.dietaryInfo.length - 3}</span>
            )}
          </div>
        )}

        <div className="food-card-actions">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(donation)}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              View Details
            </button>
          )}

          {onRequestPickup && isAvailable && !isExpired && !isOwner && (
            <button
              onClick={() => onRequestPickup(donation)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2 }}
            >
              <span>Request Pickup</span>
              <ArrowRight size={14} />
            </button>
          )}

          {isOwner && (
            <span className="badge" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', flex: 1, justifyContent: 'center' }}>
              Your Listing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
