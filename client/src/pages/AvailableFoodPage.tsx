import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Utensils,
  Wheat,
  Apple,
  Milk,
  Package,
  Coffee,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';
import { donationService } from '../services/donationService';
import { Donation } from '../types';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { PickupModal } from '../components/PickupModal';
import { ExpiryBadge } from '../components/ExpiryBadge';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const CATEGORIES_CONFIG = [
  { label: 'All', value: 'All', icon: Layers },
  { label: 'Cooked Meals', value: 'Cooked Meals', icon: Utensils },
  { label: 'Bakery & Bread', value: 'Bakery & Bread', icon: Wheat },
  { label: 'Fresh Produce', value: 'Fresh Produce', icon: Apple },
  { label: 'Dairy & Eggs', value: 'Dairy & Eggs', icon: Milk },
  { label: 'Packaged Food', value: 'Packaged & Canned', icon: Package },
  { label: 'Beverages', value: 'Beverages', icon: Coffee },
  { label: 'Other', value: 'Other', icon: Sparkles },
];

export const AvailableFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Category state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [pickupDonation, setPickupDonation] = useState<Donation | null>(null);
  const [pickupSuccessMsg, setPickupSuccessMsg] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAvailableFood = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await donationService.getDonations({
        search: searchTerm.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        onlyAvailable: true,
        limit: 50,
      });

      if (response.success) {
        setDonations(response.donations || []);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFood();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAvailableFood();
  };

  const handleInitiatePickup = (donation: Donation) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/available-food',
          donationId: donation.id,
          message: 'Please sign in or create an account to request food pickup.',
        },
      });
      return;
    }

    const donorId = donation.donor?.id || (donation.donor as any)?._id;
    if (user?.id && donorId && String(user.id) === String(donorId)) {
      setActionNotice('You are the donor of this item. You cannot request your own food donation.');
      setTimeout(() => setActionNotice(null), 5000);
      return;
    }

    setPickupDonation(donation);
  };

  const handlePickupSuccess = () => {
    setPickupDonation(null);
    setSelectedDonation(null);
    setPickupSuccessMsg('Pickup request sent successfully! Waiting for donor approval.');
    fetchAvailableFood();
    setTimeout(() => setPickupSuccessMsg(null), 6000);
  };

  const featuredItem = donations.length > 0 && selectedCategory === 'All' && !searchTerm ? donations[0] : null;
  const gridItems = featuredItem ? donations.slice(1) : donations;

  return (
    <div className="page-container">
      {/* 1. VISUALLY MEMORABLE MARKETPLACE HEADER */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Editorial Food Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
            filter: 'saturate(1.2)',
          }}
        />

        {/* Ambient Dark Gradient Scrim */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(18, 18, 20, 0.98) 0%, rgba(26, 26, 30, 0.9) 60%, rgba(32, 32, 36, 0.85) 100%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, padding: '3.5rem 2.5rem' }}>
          <div className="editorial-tag">
            <Sparkles size={14} />
            <span>Community Surplus Marketplace</span>
          </div>

          <h1 className="editorial-headline" style={{ fontSize: 'clamp(2.3rem, 4vw, 3.4rem)', marginBottom: '0.75rem' }}>
            Good Food, Waiting to Be Shared.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
            Explore surplus meals, fresh bakery goods, and farm produce available in your community right now. Every portion rescued prevents waste.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {pickupSuccessMsg && (
        <div
          className="notification-banner success animate-fade-in"
          style={{
            backgroundColor: 'rgba(0, 245, 155, 0.12)',
            border: '1px solid var(--fresh-green)',
            color: '#bbf7d0',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{pickupSuccessMsg}</span>
          <button
            onClick={() => setPickupSuccessMsg(null)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--fresh-green)' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {actionNotice && (
        <div
          className="notification-banner warning animate-fade-in"
          style={{
            backgroundColor: 'rgba(255, 183, 3, 0.14)',
            border: '1px solid var(--soon-yellow)',
            color: '#fef08a',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
          }}
        >
          {actionNotice}
        </div>
      )}

      {/* 2. SEARCH & VISUAL CATEGORY SELECTOR STRIP */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '2.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1.1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by meal name (e.g. Biryani, Sourdough, Curry, Yogurt)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                paddingLeft: '3rem',
                height: '48px',
                fontSize: '0.98rem',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.85rem', height: '48px' }}>
            Search Food
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchAvailableFood();
              }}
              className="btn btn-secondary"
              style={{ height: '48px' }}
            >
              Clear
            </button>
          )}
        </form>

        {/* Visual Category Strip with Purposeful Icons */}
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            alignItems: 'center',
          }}
        >
          {CATEGORIES_CONFIG.map((cat) => {
            const active = selectedCategory === cat.value;
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className="category-filter-item"
                style={{
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: active ? 'var(--primary)' : 'var(--bg-input)',
                  color: active ? '#121212' : 'var(--text-primary)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <IconComponent size={15} style={{ color: active ? '#121212' : 'var(--primary)' }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONTENT: Loading, Error, Empty, or Editorial Marketplace Layout */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <RefreshCw size={38} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1.25rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Fetching fresh community surplus food...
          </p>
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            border: '1px solid rgba(255, 77, 99, 0.4)',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          <AlertCircle size={44} style={{ color: 'var(--expired-red)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Unable to connect to marketplace</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchAvailableFood} className="btn btn-primary">
            <RefreshCw size={16} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : donations.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4.5rem 2rem',
            maxWidth: '580px',
            margin: '0 auto',
          }}
        >
          <ShoppingBag size={52} style={{ color: 'var(--primary)', marginBottom: '1.25rem', opacity: 0.85 }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
            No surplus food found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {selectedCategory !== 'All'
              ? `There are currently no active listings in the "${selectedCategory}" category.`
              : 'All community donations have been claimed. Check back shortly as local restaurants post daily batches.'}
          </p>
          {selectedCategory !== 'All' && (
            <button onClick={() => setSelectedCategory('All')} className="btn btn-secondary">
              View All Categories
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top Featured Spotlight Card (When browsing all without search) */}
          {featuredItem && (
            <div
              className="card card-hoverable"
              style={{
                marginBottom: '2.5rem',
                padding: 0,
                overflow: 'hidden',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-medium)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              }}
            >
              <div style={{ position: 'relative', minHeight: '260px' }}>
                <img
                  src={featuredItem.imageUrl}
                  alt={featuredItem.foodName}
                  className="img-hover-zoom"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 2,
                  }}
                >
                  <ExpiryBadge status={featuredItem.expiryStatus} timeRemaining={featuredItem.timeRemaining?.humanReadable} />
                </div>
              </div>

              <div style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="editorial-tag" style={{ margin: 0 }}>
                    Featured Rescue • {featuredItem.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.65rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  {featuredItem.foodName}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {featuredItem.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginBottom: '1.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Utensils size={16} />
                    <span>{featuredItem.availableQuantity ?? featuredItem.quantity} {featuredItem.unit} Available</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)' }}>
                    <MapPin size={16} />
                    <span>{featuredItem.location?.locality || featuredItem.location?.city}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedDonation(featuredItem)}
                    className="btn btn-secondary"
                  >
                    View Food Details
                  </button>
                  <button
                    onClick={() => handleInitiatePickup(featuredItem)}
                    className="btn btn-primary"
                  >
                    <span>Request This Pickup</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section Heading for Marketplace Catalog */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{donations.length}</strong> community food donations
            </span>
          </div>

          {/* Responsive Food Marketplace Grid */}
          <div className="food-grid">
            {gridItems.map((donation) => (
              <FoodCard
                key={donation.id}
                donation={donation}
                onViewDetails={(d) => setSelectedDonation(d)}
                onRequestPickup={(d) => handleInitiatePickup(d)}
                isOwner={Boolean(user?.id && (donation.donor?.id === user.id || (donation.donor as any)?._id === user.id))}
              />
            ))}
          </div>
        </>
      )}

      {/* Food Details Modal */}
      {selectedDonation && (
        <FoodDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onRequestPickup={(d) => {
            setSelectedDonation(null);
            handleInitiatePickup(d);
          }}
          isOwner={Boolean(user?.id && (selectedDonation.donor?.id === user.id || (selectedDonation.donor as any)?._id === user.id))}
        />
      )}

      {/* Pickup Request Modal */}
      {pickupDonation && (
        <PickupModal
          donation={pickupDonation}
          onClose={() => setPickupDonation(null)}
          onSuccess={handlePickupSuccess}
        />
      )}
    </div>
  );
};
