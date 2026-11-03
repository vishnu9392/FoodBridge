import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  MapPin,
  Utensils,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import { donationService } from '../services/donationService';
import { Donation } from '../types';
import { ExpiryBadge } from '../components/ExpiryBadge';
import { FoodDetailModal } from '../components/FoodDetailModal';

export const HomePage: React.FC = () => {
  const [featuredDonations, setFeaturedDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    // Fetch live donations for the "Food Worth Saving" editorial section
    donationService
      .getDonations({ limit: 4, onlyAvailable: true })
      .then((res) => {
        if (res.success && res.donations) {
          setFeaturedDonations(res.donations);
        }
      })
      .catch(() => {
        // Graceful handling
      });
  }, []);

  const leadItem = featuredDonations[0] || null;
  const supportingItems = featuredDonations.slice(1, 4);

  return (
    <div className="home-page" style={{ paddingTop: '4.5rem' }}>
      {/* 1. EDITORIAL HERO: Good Food. Better Futures. */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 5.5rem',
          backgroundColor: 'var(--bg-primary)',
          overflow: 'hidden',
        }}
      >
        {/* Warm Ambient Texture / Radial Light */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '750px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255, 140, 66, 0.12) 0%, rgba(18, 18, 18, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Bold Asymmetric Editorial Headline */}
            <div>
              <div className="editorial-tag">
                <Sparkles size={14} />
                <span>Community Surplus Food Rescue</span>
              </div>

              <h1
                className="editorial-headline"
                style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
                  marginBottom: '1.5rem',
                }}
              >
                Good Food.<br />
                <span style={{ color: 'var(--primary)' }}>Better Futures.</span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '2.5rem',
                  maxWidth: '540px',
                }}
              >
                Every day, good food goes unused while people need a meal. FoodBridge brings communities together to make sure surplus food finds a purpose.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  marginBottom: '2.5rem',
                }}
              >
                <Link
                  to="/available-food"
                  className="btn btn-primary btn-lg"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontWeight: 600,
                  }}
                >
                  <span>Explore Available Food</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/donate"
                  className="btn btn-secondary btn-lg"
                  style={{ fontWeight: 600 }}
                >
                  Donate Surplus Food
                </Link>
              </div>

              {/* Editorial Quality Pledges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  <span>Real-Time Expiry Engine</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--fresh-green)' }} />
                  <span>Verified Safe Handovers</span>
                </div>
              </div>
            </div>

            {/* Right Column: Asymmetric Editorial Image Composition */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-medium)',
                  boxShadow: 'var(--shadow-lg)',
                  background: 'var(--bg-card)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80"
                  alt="Wholesome freshly prepared Indian meal ready for community sharing"
                  className="img-hover-zoom"
                  style={{
                    width: '100%',
                    height: '440px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Warm Dark Gradient Vignette */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.05) 0%, rgba(18, 18, 18, 0.8) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Editorial Callout Pill */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.75rem',
                    left: '1.75rem',
                    right: '1.75rem',
                    backgroundColor: 'rgba(26, 26, 29, 0.88)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 140, 66, 0.35)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                      }}
                    >
                      <Utensils size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Good Food Deserves to Be Shared
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Fresh meals & groceries rescued daily across our community
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FOOD RESCUE JOURNEY: 01 SHARE, 02 DISCOVER, 03 COLLECT */}
      <section
        style={{
          padding: '5rem 0',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="editorial-tag" style={{ justifyContent: 'center' }}>
              <span>The Food Rescue Journey</span>
            </div>
            <h2 className="editorial-headline" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              How Surplus Food Finds a Purpose
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', fontSize: '1.02rem' }}>
              Three purposeful steps transforming kitchen surplus into hot nourishment for local families.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Stage 01: SHARE */}
            <div className="journey-stage-card">
              <div className="journey-stage-numeral">01</div>
              <div className="journey-stage-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh artisan bakery goods being prepared for donation"
                />
              </div>
              <div className="journey-stage-content">
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Stage 01
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                  SHARE
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                  Have more food than you need? Put it to good use. Post surplus meals or fresh pantry ingredients in under two minutes with automated expiry intelligence.
                </p>
              </div>
            </div>

            {/* Stage 02: DISCOVER */}
            <div className="journey-stage-card">
              <div className="journey-stage-numeral" style={{ color: 'var(--fresh-green)', borderColor: 'rgba(0, 245, 155, 0.3)' }}>
                02
              </div>
              <div className="journey-stage-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80"
                  alt="Abundant fresh fruits and produce ready for discovery"
                />
              </div>
              <div className="journey-stage-content">
                <span style={{ fontSize: '0.78rem', color: 'var(--fresh-green)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Stage 02
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                  DISCOVER
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                  Find surplus food available in your community. Local shelters, soup kitchens, and families explore real-time food listings filtered by category and locality.
                </p>
              </div>
            </div>

            {/* Stage 03: COLLECT */}
            <div className="journey-stage-card">
              <div className="journey-stage-numeral" style={{ color: 'var(--info-blue)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                03
              </div>
              <div className="journey-stage-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                  alt="Packed nutritious meals coordinated for community collection"
                />
              </div>
              <div className="journey-stage-content">
                <span style={{ fontSize: '0.78rem', color: 'var(--info-blue)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Stage 03
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                  COLLECT
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                  Connect with the donor and arrange a pickup. Confirm portion reservations, receive turn-by-turn directions, and complete a seamless, dignified handover.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: FOOD WORTH SAVING (EDITORIAL CURATED SELECTION) */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div className="editorial-tag">
                <span>Real-Time Community Marketplace</span>
              </div>
              <h2 className="editorial-headline" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                Food Worth Saving
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', margin: 0, maxWidth: '600px' }}>
                Curated surplus batches waiting for collection right now across your neighborhood.
              </p>
            </div>

            <Link
              to="/available-food"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>View All Available Food</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Asymmetric Editorial Grid: 1 Hero Spotlight Card + 2–3 Supporting Cards */}
          {leadItem ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'stretch',
              }}
            >
              {/* Large Spotlight Card */}
              <div
                className="card card-hoverable"
                style={{
                  gridColumn: 'span 1',
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden' }}>
                  <img
                    src={leadItem.imageUrl}
                    alt={leadItem.foodName}
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
                    <ExpiryBadge status={leadItem.expiryStatus} timeRemaining={leadItem.timeRemaining?.humanReadable} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      backgroundColor: 'rgba(18, 18, 22, 0.9)',
                      padding: '0.35rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    Featured Spotlight • {leadItem.category}
                  </div>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                    {leadItem.foodName}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {leadItem.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      marginBottom: '1.25rem',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
                      <Utensils size={15} />
                      <span>{leadItem.availableQuantity ?? leadItem.quantity} {leadItem.unit} Available</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <MapPin size={15} />
                      <span>{leadItem.location?.locality || leadItem.location?.city}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDonation(leadItem)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.8rem' }}
                  >
                    View Details & Pickup Request
                  </button>
                </div>
              </div>

              {/* Supporting Editorial Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {supportingItems.map((item) => (
                  <div
                    key={item.id}
                    className="card card-hoverable"
                    onClick={() => setSelectedDonation(item)}
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.foodName}
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                        <span>•</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.location?.locality || item.location?.city}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontSize: '1.08rem',
                          margin: '0 0 0.4rem',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.foodName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {item.availableQuantity ?? item.quantity} {item.unit}
                        </span>
                        <ExpiryBadge status={item.expiryStatus} timeRemaining={item.timeRemaining?.humanReadable} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Loading fresh food selections...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTION: WHY FOODBRIDGE */}
      <section
        style={{
          padding: '5rem 0',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div className="editorial-tag">
                <span>Purpose-Driven Mission</span>
              </div>
              <h2 className="editorial-headline" style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>
                Why FoodBridge Exists
              </h2>
              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                }}
              >
                Food waste isn’t just an economic loss — it represents wasted agricultural effort, fresh water, and vital nourishment. We build digital bridges between community kitchens and people who need meals.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Reduce Avoidable Food Waste:</strong>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
                      Redirect edible meals from landfills into community dining tables.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--fresh-green)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Direct Donor-Recipient Synergy:</strong>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
                      Connect restaurants, bakeries, and catered events directly with neighborhood shelters.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--info-blue)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Turnkey Pickup Coordination:</strong>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
                      Organize portion reservations, scheduled collection times, and Google Maps routing.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Quote / Mission Frame */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-medium)',
                padding: '3rem 2.5rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '3.5rem',
                  fontFamily: 'serif',
                  color: 'var(--primary)',
                  lineHeight: 1,
                  marginBottom: '1rem',
                  opacity: 0.6,
                }}
              >
                “
              </div>
              <blockquote
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.45rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  fontStyle: 'italic',
                  marginBottom: '1.75rem',
                }}
              >
                Good food deserves to be shared, not wasted. Every portion redirected brings dignity, hope, and relief to our neighbors.
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HeartHandshake size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  FoodBridge Community Charter
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--bg-primary)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="editorial-tag" style={{ justifyContent: 'center' }}>
            <span>Join the Movement</span>
          </div>

          <h2
            className="editorial-headline"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', marginBottom: '1.25rem' }}
          >
            One small share can make a meaningful difference.
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.12rem',
              marginBottom: '2.5rem',
              lineHeight: 1.65,
            }}
          >
            Whether you run a kitchen with extra portions or represent a relief center feeding families, your participation keeps community food circulating.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/donate"
              className="btn btn-primary btn-lg"
              style={{ padding: '0.9rem 2.2rem', fontWeight: 600 }}
            >
              Donate Food
            </Link>

            <Link
              to="/available-food"
              className="btn btn-secondary btn-lg"
              style={{ padding: '0.9rem 2.2rem', fontWeight: 600 }}
            >
              Find Available Food
            </Link>
          </div>
        </div>
      </section>

      {/* Food Details Modal */}
      {selectedDonation && (
        <FoodDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          canRequestPickup={true}
        />
      )}
    </div>
  );
};
