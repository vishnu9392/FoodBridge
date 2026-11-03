import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Truck,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Clock,
  Search,
  CheckCircle,
  Calendar,
  MapPin,
  Utensils,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { donationService } from '../services/donationService';
import { pickupService } from '../services/pickupService';
import { Donation, Pickup } from '../types';
import { ExpiryBadge } from '../components/ExpiryBadge';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { PickupModal } from '../components/PickupModal';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user, isDonor } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Donor Data
  const [donorDonations, setDonorDonations] = useState<Donation[]>([]);
  const [donorPickups, setDonorPickups] = useState<Pickup[]>([]);

  // Recipient Data
  const [recipientPickups, setRecipientPickups] = useState<Pickup[]>([]);
  const [availableSuggestions, setAvailableSuggestions] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [pickupDonation, setPickupDonation] = useState<Donation | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDonor) {
        const [donationsRes, pickupsRes] = await Promise.all([
          donationService.getDonorDonations(),
          pickupService.getPickups('donor'),
        ]);
        if (donationsRes.success) setDonorDonations(donationsRes.donations || []);
        if (pickupsRes.success) setDonorPickups(pickupsRes.pickups || []);
      } else {
        const [pickupsRes, availableRes] = await Promise.all([
          pickupService.getPickups('recipient'),
          donationService.getDonations({ limit: 4, onlyAvailable: true }),
        ]);
        if (pickupsRes.success) setRecipientPickups(pickupsRes.pickups || []);
        if (availableRes.success) setAvailableSuggestions(availableRes.donations || []);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isDonor]);

  const handleApprovePickup = async (pickupId: string) => {
    try {
      await pickupService.updatePickupStatus(pickupId, 'approved');
      setActionMessage('Pickup request approved! Donation reserved.');
      fetchDashboardData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleRejectPickup = async (pickupId: string) => {
    try {
      await pickupService.updatePickupStatus(pickupId, 'rejected', 'Time conflict');
      setActionMessage('Pickup request rejected.');
      fetchDashboardData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    if (!window.confirm('Are you sure you want to delete this food donation listing?')) {
      return;
    }
    try {
      await donationService.deleteDonation(donationId);
      setActionMessage('Donation listing deleted successfully.');
      fetchDashboardData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your food rescue workspace...</p>
      </div>
    );
  }

  // =============================================================
  // 1. DONOR DASHBOARD VIEW: "Your Donations Make a Difference."
  // =============================================================
  if (isDonor) {
    const activeDonationsCount = donorDonations.filter((d) => d.status === 'available').length;
    const pendingRequests = donorPickups.filter((p) => p.status === 'pending');
    const completedPickupsCount = donorPickups.filter((p) => p.status === 'completed').length;
    const expiringSoonCount = donorDonations.filter((d) => d.expiryStatus === 'expiring_soon').length;

    return (
      <div className="page-container">
        {/* Editorial Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="editorial-tag">
              <Sparkles size={14} />
              <span>Donor Kitchen Workspace</span>
            </div>
            <h1 className="editorial-headline" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: '0.4rem' }}>
              Your Donations Make a Difference.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0, maxWidth: '640px' }}>
              Welcome back, {user?.name}. Manage your surplus meals, review community pickup requests, and track meals shared.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/donate" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <PlusCircle size={16} />
              <span>Donate Food</span>
            </Link>
            <Link to="/pickups" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Truck size={16} />
              <span>Manage Pickups</span>
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {actionMessage && (
          <div className="notification-banner success animate-fade-in" style={{ backgroundColor: 'rgba(0, 245, 155, 0.12)', border: '1px solid var(--fresh-green)', color: '#bbf7d0', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="notification-banner danger animate-fade-in" style={{ backgroundColor: 'rgba(255, 77, 99, 0.12)', border: '1px solid var(--expired-red)', color: '#fecdd3', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
            {error}
          </div>
        )}

        {/* 4 Culinary Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Surplus Listings
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.35rem' }}>
              {activeDonationsCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Incoming Pickup Requests
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: pendingRequests.length > 0 ? 'var(--soon-yellow)' : 'var(--text-primary)', marginTop: '0.35rem' }}>
              {pendingRequests.length}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed Handover Pickups
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--fresh-green)', marginTop: '0.35rem' }}>
              {completedPickupsCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Urgent Expiring (&lt;24h)
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: expiringSoonCount > 0 ? 'var(--soon-yellow)' : 'var(--text-primary)', marginTop: '0.35rem' }}>
              {expiringSoonCount}
            </div>
          </div>
        </div>

        {/* Section 1: Incoming Pickup Requests */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
              Incoming Pickup Requests ({pendingRequests.length})
            </h2>
            <Link to="/pickups" style={{ fontSize: '0.88rem', color: 'var(--primary)', textDecoration: 'none' }}>
              View all pickups &rarr;
            </Link>
          </div>

          {pendingRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="card"
                  style={{
                    padding: '1.35rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0 }}>
                    {req.donation?.imageUrl && (
                      <img
                        src={req.donation.imageUrl}
                        alt={req.donation.foodName}
                        style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {req.donation?.foodName || 'Donation Item'}
                        </h4>
                        <span className="badge badge-soon">
                          Requested: {req.requestedQuantity || 1} {req.donation?.unit || 'portions'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Recipient: <strong>{req.recipient?.name}</strong> {req.recipient?.organization && `(${req.recipient.organization})`}
                      </div>
                      {(req.preferredDate || req.preferredTime) && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--soon-yellow)', marginTop: '0.2rem' }}>
                          Preferred Window: {req.preferredDate} {req.preferredTime ? `at ${req.preferredTime}` : ''}
                        </div>
                      )}
                      {req.notes && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Note: "{req.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button onClick={() => handleRejectPickup(req.id)} className="btn btn-secondary btn-sm">
                      Reject
                    </button>
                    <button onClick={() => handleApprovePickup(req.id)} className="btn btn-primary btn-sm">
                      <CheckCircle2 size={15} />
                      <span>Approve Request</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No pending pickup requests at this time. When community shelters request your meals, they will appear here.
            </div>
          )}
        </div>

        {/* Section 2: Recent Food Donations with Thumbnails */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
              Your Active Food Donations
            </h2>
            <Link to="/donate" style={{ fontSize: '0.88rem', color: 'var(--primary)', textDecoration: 'none' }}>
              + List New Surplus Food
            </Link>
          </div>

          {donorDonations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {donorDonations.map((item) => (
                <div key={item.id} className="card card-hoverable" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.foodName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                      <ExpiryBadge status={item.expiryStatus} timeRemaining={item.timeRemaining?.humanReadable} />
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {item.category}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                      {item.foodName}
                    </h4>
                    <div style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {item.availableQuantity !== undefined ? item.availableQuantity : item.quantity} {item.unit} available
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                        Status: {item.status}
                      </span>
                      <button
                        onClick={() => handleDeleteDonation(item.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--expired-red)', padding: '0.3rem 0.6rem' }}
                        title="Delete listing"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                You haven't listed any surplus food donations yet.
              </p>
              <Link to="/donate" className="btn btn-primary">
                List Your First Food Donation
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================================
  // 2. RECIPIENT DASHBOARD VIEW: "Find Something Good Today."
  // =============================================================
  const pendingRecipientCount = recipientPickups.filter((p) => p.status === 'pending').length;
  const approvedRecipientCount = recipientPickups.filter((p) => p.status === 'approved').length;
  const completedRecipientCount = recipientPickups.filter((p) => p.status === 'completed').length;

  return (
    <div className="page-container">
      {/* Editorial Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="editorial-tag">
            <Sparkles size={14} />
            <span>Community Relief Hub</span>
          </div>
          <h1 className="editorial-headline" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: '0.4rem' }}>
            Find Something Good Today.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0, maxWidth: '640px' }}>
            Welcome, {user?.name}. Discover fresh surplus meals, track your active pickup requests, and coordinate collection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link to="/available-food" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <Search size={16} />
            <span>Browse Available Food</span>
          </Link>
          <Link to="/pickups" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <Truck size={16} />
            <span>My Pickups</span>
          </Link>
        </div>
      </div>

      {/* Recipient Metric Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Requests
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--soon-yellow)', marginTop: '0.35rem' }}>
            {pendingRecipientCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Approved Pickups (Ready)
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.35rem' }}>
            {approvedRecipientCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completed Collections
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--fresh-green)', marginTop: '0.35rem' }}>
            {completedRecipientCount}
          </div>
        </div>
      </div>

      {/* Section 1: Active Pickup Requests */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
            Active Pickup Requests
          </h2>
          <Link to="/pickups" style={{ fontSize: '0.88rem', color: 'var(--primary)', textDecoration: 'none' }}>
            View all pickups &rarr;
          </Link>
        </div>

        {recipientPickups.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recipientPickups.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0 }}>
                  {item.donation?.imageUrl && (
                    <img
                      src={item.donation.imageUrl}
                      alt={item.donation.foodName}
                      style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {item.donation?.foodName || 'Donation Item'}
                      </h4>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: item.status === 'approved' ? 'var(--info-bg)' : item.status === 'completed' ? 'var(--fresh-bg)' : 'var(--soon-bg)',
                          color: item.status === 'approved' ? 'var(--info-blue)' : item.status === 'completed' ? 'var(--fresh-green)' : 'var(--soon-yellow)',
                        }}
                      >
                        {item.status === 'approved' ? 'Approved & Ready' : item.status === 'completed' ? 'Collected' : 'Pending Donor Review'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Donor Kitchen: <strong>{item.donor?.organization || item.donor?.name || 'Local Kitchen'}</strong>
                    </div>

                    {item.status === 'approved' && item.donation?.location?.address && (
                      <div style={{ fontSize: '0.84rem', color: 'var(--primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} />
                        <span>Pickup Location: {item.donation.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.status === 'approved' && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${item.donation?.location?.address || ''}, ${item.donation?.location?.city || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <span>Get Directions</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pickup requests yet. Browse the community marketplace below to claim surplus meals.
          </div>
        )}
      </div>

      {/* Section 2: Recommended Surplus Food */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
            Available for Collection Today
          </h2>
          <Link to="/available-food" style={{ fontSize: '0.88rem', color: 'var(--primary)', textDecoration: 'none' }}>
            View entire marketplace &rarr;
          </Link>
        </div>

        {availableSuggestions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {availableSuggestions.map((item) => (
              <div key={item.id} className="card card-hoverable" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.foodName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    <ExpiryBadge status={item.expiryStatus} timeRemaining={item.timeRemaining?.humanReadable} />
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {item.category}
                  </span>
                  <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                    {item.foodName}
                  </h4>
                  <div style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                    {item.availableQuantity ?? item.quantity} {item.unit} available
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Pickup: {item.location?.locality || item.location?.city}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.65rem' }}>
                    <button
                      onClick={() => setSelectedDonation(item)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setPickupDonation(item)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1.2 }}
                    >
                      Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No surplus donations available right now.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDonation && (
        <FoodDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onRequestPickup={(d) => {
            setSelectedDonation(null);
            setPickupDonation(d);
          }}
        />
      )}

      {/* Pickup Request Modal */}
      {pickupDonation && (
        <PickupModal
          donation={pickupDonation}
          onClose={() => setPickupDonation(null)}
          onSuccess={() => {
            fetchDashboardData();
            setActionMessage('Pickup request sent successfully! Waiting for donor approval.');
            setTimeout(() => setActionMessage(null), 5000);
          }}
        />
      )}
    </div>
  );
};
