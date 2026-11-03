import React, { useEffect, useState } from 'react';
import {
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  MapPin,
  User,
  Phone,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { pickupService } from '../services/pickupService';
import { Pickup, PickupStatus } from '../types';
import { ExpiryBadge } from '../components/ExpiryBadge';
import { MapPreview } from '../components/MapPreview';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export const PickupManagementPage: React.FC = () => {
  const { user, isDonor, isRecipient } = useAuth();

  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'recipient' | 'donor'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPickups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pickupService.getPickups(activeTab, statusFilter !== 'all' ? statusFilter : undefined);
      if (response.success) {
        setPickups(response.pickups);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [activeTab, statusFilter]);

  const handleUpdateStatus = async (pickupId: string, status: PickupStatus, reason?: string) => {
    try {
      await pickupService.updatePickupStatus(pickupId, status, reason);
      setActionSuccess(`Pickup status updated to ${status}.`);
      fetchPickups();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const getStatusBadge = (status: PickupStatus) => {
    switch (status) {
      case 'pending':
        return <span className="badge" style={{ backgroundColor: 'var(--soon-bg)', color: 'var(--soon-yellow)', border: '1px solid var(--soon-border)' }}>Pending Approval</span>;
      case 'approved':
        return <span className="badge" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-blue)', border: '1px solid rgba(52,152,219,0.3)' }}>Reserved & Approved</span>;
      case 'completed':
        return <span className="badge" style={{ backgroundColor: 'var(--fresh-bg)', color: 'var(--fresh-green)', border: '1px solid var(--fresh-border)' }}>Handover Completed</span>;
      case 'cancelled':
        return <span className="badge" style={{ backgroundColor: 'var(--expired-bg)', color: 'var(--expired-red)', border: '1px solid var(--expired-border)' }}>Cancelled</span>;
      case 'rejected':
        return <span className="badge" style={{ backgroundColor: 'var(--expired-bg)', color: 'var(--expired-red)', border: '1px solid var(--expired-border)' }}>Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container main-content" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
            Pickup & Logistics Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track donation collection requests, coordinate arrival logistics, and confirm mutual handovers.
          </p>
        </div>

        <button onClick={fetchPickups} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Requests
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="pickup-tabs">
        <button
          className={`pickup-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Involved Pickups
        </button>
        <button
          className={`pickup-tab-btn ${activeTab === 'recipient' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipient')}
        >
          My Pickup Requests (As Recipient)
        </button>
        <button
          className={`pickup-tab-btn ${activeTab === 'donor' ? 'active' : ''}`}
          onClick={() => setActiveTab('donor')}
        >
          Incoming Requests (As Donor)
        </button>
      </div>

      {/* Status Filter Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'completed', 'cancelled', 'rejected'].map((st) => (
          <button
            key={st}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'all' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Retrieving pickup requests...</p>
        </div>
      ) : pickups.length > 0 ? (
        <div className="pickup-cards-list">
          {pickups.map((item) => {
            const isUserDonor = user?.id === item.donor?.id || user?.id === (item.donor as any)?._id;
            const isUserRecipient = user?.id === item.recipient?.id || user?.id === (item.recipient as any)?._id;

            return (
              <div key={item.id} className="pickup-card">
                <img
                  src={item.donation?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                  alt={item.donation?.foodName}
                  className="pickup-food-thumb"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                  }}
                />

                <div className="pickup-details" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>{item.donation?.foodName || 'Food Item'}</h3>
                    {getStatusBadge(item.status)}
                    <span className="tag" style={{ backgroundColor: 'rgba(255, 140, 66, 0.15)', color: 'var(--primary)', fontWeight: 600 }}>
                      Requested: {item.requestedQuantity || 1} {item.donation?.unit || 'portions'}
                    </span>
                  </div>

                  {item.donation?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>
                        {item.status === 'approved' || item.status === 'completed' || isUserDonor
                          ? (item.donation.location.address ? `${item.donation.location.address}, ` : '') + item.donation.location.city
                          : (item.donation.location.locality ? `${item.donation.location.locality}, ` : '') + item.donation.location.city}
                      </span>
                    </div>
                  )}

                  {(item.preferredDate || item.preferredTime || item.requestedPickupTime) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--soon-yellow)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <Calendar size={14} />
                      <span>
                        Preferred Time: {item.preferredDate || ''} {item.preferredTime ? `at ${item.preferredTime}` : ''}
                        {!item.preferredDate && item.requestedPickupTime ? new Date(item.requestedPickupTime).toLocaleString() : ''}
                      </span>
                    </div>
                  )}

                  {item.notes && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: '#1E1E1E', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.4rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Note:</span> "{item.notes}"
                    </div>
                  )}

                  {/* Participant Meta */}
                  <div className="pickup-participants-meta" style={{ marginTop: '0.65rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Donor: </span>
                      <strong>{item.donor?.name || 'Community Donor'}</strong>{' '}
                      {item.donor?.phone ? `(${item.donor.phone})` : (item.status === 'pending' && isUserRecipient ? '(Contact hidden until approved)' : '')}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Recipient: </span>
                      <strong>{item.recipient?.name || 'Community Recipient'}</strong> {item.recipient?.phone && `(${item.recipient.phone})`}
                    </div>
                  </div>

                  {/* Map Preview with Directions when Approved */}
                  {(item.status === 'approved' || item.status === 'completed') && item.donation?.location && (
                    <div style={{ marginTop: '0.85rem' }}>
                      <MapPreview
                        location={item.donation.location}
                        title={item.donation.foodName}
                        isExact={true}
                      />
                    </div>
                  )}
                </div>

                {/* State Machine Action Controls */}
                <div className="pickup-actions">
                  {/* Donor Approval / Rejection on Pending */}
                  {item.status === 'pending' && isUserDonor && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'rejected', 'Time conflict')}
                        className="btn btn-secondary btn-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                    </div>
                  )}

                  {/* Recipient Cancel on Pending */}
                  {item.status === 'pending' && isUserRecipient && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'cancelled', 'Cancelled by recipient')}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* Approved: Mark Completed or Cancel */}
                  {item.status === 'approved' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'completed')}
                        className="btn btn-success btn-sm"
                      >
                        <ShieldCheck size={14} /> Confirm Handover Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'cancelled', 'Unable to complete collection')}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel Pickup
                      </button>
                    </div>
                  )}

                  {/* Completed / Cancelled terminal status indicator */}
                  {['completed', 'cancelled', 'rejected'].includes(item.status) && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      Completed on {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Pickup Requests Found</h3>
          <p>You currently do not have any active or past food pickups in this category.</p>
        </div>
      )}
    </div>
  );
};
