import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, AlertCircle, CheckCircle, Utensils, Send, User } from 'lucide-react';
import { Donation } from '../types';
import { pickupService } from '../services/pickupService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface PickupModalProps {
  donation: Donation;
  onClose: () => void;
  onSuccess: () => void;
}

export const PickupModal: React.FC<PickupModalProps> = ({
  donation,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const maxAvailable =
    donation.availableQuantity !== undefined
      ? donation.availableQuantity
      : donation.quantity;

  const todayStr = new Date().toISOString().split('T')[0];
  const expiryDateStr = new Date(donation.expiryDate).toISOString().split('T')[0];

  const [requestedQuantity, setRequestedQuantity] = useState<number>(1);
  const [preferredDate, setPreferredDate] = useState<string>(todayStr);
  const [preferredTime, setPreferredTime] = useState<string>('12:00');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requestedQuantity <= 0) {
      setError('Please specify a quantity greater than zero.');
      return;
    }

    if (requestedQuantity > maxAvailable) {
      setError(`Cannot request ${requestedQuantity} ${donation.unit}. Only ${maxAvailable} ${donation.unit} available.`);
      return;
    }

    if (preferredDate && preferredDate > expiryDateStr) {
      setError(`Preferred pickup date cannot be later than the food expiry date (${new Date(donation.expiryDate).toLocaleDateString()}).`);
      return;
    }

    setSubmitting(true);

    try {
      // Build combined requested pickup ISO timestamp if both date & time are provided
      let combinedIso: string | undefined = undefined;
      if (preferredDate && preferredTime) {
        combinedIso = new Date(`${preferredDate}T${preferredTime}:00`).toISOString();
      }

      await pickupService.createPickupRequest({
        donationId: donation.id,
        requestedQuantity: Number(requestedQuantity),
        preferredDate,
        preferredTime,
        requestedPickupTime: combinedIso,
        notes: notes.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1600);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content animate-scale-in"
        style={{
          maxWidth: '520px',
          backgroundColor: '#161616',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
                fontSize: '0.76rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Food Rescue Request
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
              Request Food Pickup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
          >
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 77, 99, 0.12)',
                  border: '1px solid #FF4D63',
                  color: '#FFB3BA',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 245, 155, 0.12)',
                  border: '1px solid #00F59B',
                  color: '#E6FFF5',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={18} style={{ color: '#00F59B', flexShrink: 0 }} />
                <span>Pickup request sent successfully! Waiting for donor approval.</span>
              </div>
            )}

            {/* Requester Identity Banner */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                  <User size={15} style={{ color: 'var(--primary)' }} />
                  <span>Requesting as:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
                </div>
                <span
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: user.role === 'donor' ? 'var(--primary-subtle)' : 'var(--fresh-bg)',
                    color: user.role === 'donor' ? 'var(--primary)' : 'var(--fresh-green)',
                    border: user.role === 'donor' ? '1px solid rgba(255,140,66,0.3)' : '1px solid rgba(0,245,155,0.3)',
                  }}
                >
                  {user.role}
                </span>
              </div>
            )}

            {/* Donation Summary Card */}
            <div
              style={{
                padding: '0.9rem 1.1rem',
                backgroundColor: '#1E1E1E',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <img
                src={donation.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                alt={donation.foodName}
                style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '0.96rem',
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {donation.foodName}
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>{donation.category}</span>
                  <span>•</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {maxAvailable} {donation.unit} available
                  </span>
                </div>
              </div>
            </div>

            {/* Requested Quantity */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="requestedQty" style={{ margin: 0, fontSize: '0.86rem' }}>
                  Quantity to Request ({donation.unit}) *
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Max: {maxAvailable} {donation.unit}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="requestedQty"
                  type="number"
                  min="0.1"
                  max={maxAvailable}
                  step="any"
                  required
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(parseFloat(e.target.value) || 0)}
                  className="form-control"
                  style={{
                    width: '100%',
                    backgroundColor: '#1E1E1E',
                    color: 'var(--text-main)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.92rem',
                  }}
                />
              </div>
            </div>

            {/* Preferred Date & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="preferredDate" style={{ fontSize: '0.84rem', marginBottom: '0.4rem' }}>
                  Preferred Pickup Date *
                </label>
                <input
                  id="preferredDate"
                  type="date"
                  min={todayStr}
                  max={expiryDateStr}
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="form-control"
                  style={{
                    width: '100%',
                    backgroundColor: '#1E1E1E',
                    color: 'var(--text-main)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.75rem',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="preferredTime" style={{ fontSize: '0.84rem', marginBottom: '0.4rem' }}>
                  Preferred Pickup Time *
                </label>
                <input
                  id="preferredTime"
                  type="time"
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="form-control"
                  style={{
                    width: '100%',
                    backgroundColor: '#1E1E1E',
                    color: 'var(--text-main)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.75rem',
                    fontSize: '0.86rem',
                  }}
                />
              </div>
            </div>

            {/* Recipient Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="pickupNotes" style={{ fontSize: '0.84rem', marginBottom: '0.4rem' }}>
                Pickup Notes & Transportation Details (Optional)
              </label>
              <textarea
                id="pickupNotes"
                rows={3}
                placeholder="e.g., Arriving by van with insulated food boxes at approx 12:30 PM..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-control"
                maxLength={500}
                style={{
                  width: '100%',
                  backgroundColor: '#1E1E1E',
                  color: 'var(--text-main)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

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
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.5rem',
                fontWeight: 600,
              }}
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
