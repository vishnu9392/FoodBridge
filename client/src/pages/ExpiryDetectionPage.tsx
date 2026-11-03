import React, { useEffect, useState } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calculator,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { expiryService, ExpiryAnalyticsResponse } from '../services/expiryService';
import { ShelfLifeEstimateResult, Donation } from '../types';
import { ExpiryBadge } from '../components/ExpiryBadge';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { getErrorMessage } from '../services/api';

export const ExpiryDetectionPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<ExpiryAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Shelf-life Estimator form state
  const [category, setCategory] = useState<string>('Cooked Meals');
  const [prepTime, setPrepTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [storage, setStorage] = useState<'room_temperature' | 'refrigerated' | 'frozen'>('refrigerated');
  const [estimateResult, setEstimateResult] = useState<ShelfLifeEstimateResult | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expiryService.getExpiryAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstimating(true);
    try {
      const response = await expiryService.estimateShelfLife({
        category,
        preparationDate: new Date(prepTime).toISOString(),
        storageCondition: storage,
      });
      if (response.success) {
        setEstimateResult(response.result);
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setEstimating(false);
    }
  };

  const counts = analytics?.counts || {
    fresh: 0,
    expiringSoon: 0,
    expired: 0,
    totalActive: 0,
  };

  return (
    <div className="container main-content" style={{ paddingBottom: '4rem' }}>
      {/* Hero Banner */}
      <div className="expiry-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--soon-yellow)', marginBottom: '0.75rem' }}>
          <Clock size={22} />
          <span style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            Algorithmic Food Waste Prevention
          </span>
        </div>
        <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Real-Time Food Expiry Intelligence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '780px' }}>
          Perishable food rescue requires precise timing. FoodBridge continuously evaluates remaining shelf life relative to the current timestamp to categorize surplus batches and highlight urgent pickup windows.
        </p>

        {/* 3 Tier Rule Engine Explainer Cards */}
        <div className="expiry-rules-grid">
          <div className="expiry-rule-card rule-fresh">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--fresh-green)', marginBottom: '0.5rem' }}>
              <CheckCircle size={20} />
              <h3 style={{ fontSize: '1.15rem' }}>Fresh Tier</h3>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              <strong>Condition:</strong> Remaining time &gt; 24 Hours
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Standard safe distribution window. Listed on the public browse directory for regular community pickup.
            </p>
            <div style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.4rem', color: 'var(--fresh-green)' }}>
              {counts.fresh} Listings
            </div>
          </div>

          <div className="expiry-rule-card rule-soon">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--soon-yellow)', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: '1.15rem' }}>Expiring Soon Tier</h3>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              <strong>Condition:</strong> 0h &lt; Remaining time ≤ 24 Hours
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Urgent rescue window. Flagged with pulsating indicators and prioritized at the top of search rankings.
            </p>
            <div style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.4rem', color: 'var(--soon-yellow)' }}>
              {counts.expiringSoon} Urgent
            </div>
          </div>

          <div className="expiry-rule-card rule-expired">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--expired-red)', marginBottom: '0.5rem' }}>
              <XCircle size={20} />
              <h3 style={{ fontSize: '1.15rem' }}>Expired Tier</h3>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              <strong>Condition:</strong> Expiry timestamp has passed
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Automatically removed from the public active food directory to safeguard community recipient health.
            </p>
            <div style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.4rem', color: 'var(--expired-red)' }}>
              {counts.expired} Deactivated
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Date-Based Estimate Disclaimer */}
      <div className="alert alert-warning" style={{ alignItems: 'flex-start' }}>
        <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Food Safety & Date-Based Estimation Notice:</strong>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {analytics?.disclaimer ||
              'Notice: Expiry status calculations are date-based mathematical estimates designed to assist in timely food rescue triage. They do not constitute a laboratory food safety certification. Always perform sensory checks (appearance, aroma, temperature) and adhere to local public health regulations before distributing or consuming food.'}
          </p>
        </div>
      </div>

      {/* Interactive Shelf-Life Calculator Tool */}
      <div className="calculator-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Calculator size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.4rem' }}>Interactive Shelf-Life & Safe Expiry Estimator</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          Simulate safe storage windows based on food category and temperature control parameters before posting a donation.
        </p>

        <form onSubmit={handleEstimate}>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Food Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Cooked Meals">Cooked Meals (Prepared dishes)</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce">Fresh Produce (Fruits & Greens)</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Packaged & Canned">Packaged & Canned Goods</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other Perishables</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preparation Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Storage Environment</label>
              <select
                className="form-select"
                value={storage}
                onChange={(e) => setStorage(e.target.value as any)}
              >
                <option value="refrigerated">Refrigerated (Below 4°C / 40°F)</option>
                <option value="room_temperature">Room Temperature (Ambient)</option>
                <option value="frozen">Deep Frozen (Below -18°C / 0°F)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={estimating}
          >
            <Sparkles size={16} />
            <span>{estimating ? 'Calculating Algorithm...' : 'Calculate Safe Expiry Threshold'}</span>
          </button>
        </form>

        {/* Calculation Result */}
        {estimateResult && (
          <div style={{ marginTop: '1.75rem', padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Algorithmic Recommendation:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.92rem' }}>
              <div>
                <strong>Estimated Safe Window:</strong> {estimateResult.estimatedShelfLifeHours} hours
              </div>
              <div>
                <strong>Recommended Expiry Timestamp:</strong> {new Date(estimateResult.suggestedExpiryDate).toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Best Practice Guidelines:</strong> {estimateResult.foodSafetyNotes}
            </div>
          </div>
        )}
      </div>

      {/* Urgent Expiring Soon Items Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pulse-indicator" style={{ backgroundColor: 'var(--soon-yellow)' }} />
              <span>Urgent: Donations Expiring in the Next 24 Hours</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Immediate priority for local shelters, soup kitchens, and volunteers.
            </p>
          </div>
        </div>

        {analytics?.expiringSoonListings && analytics.expiringSoonListings.length > 0 ? (
          <div className="food-grid">
            {analytics.expiringSoonListings.map((item) => (
              <FoodCard
                key={item.id}
                donation={item}
                onViewDetails={(d) => setSelectedDonation(d)}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No items currently in the critical &lt;24h expiry window. All active food donations are safely within fresh thresholds.
          </div>
        )}
      </div>

      <FoodDetailModal
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />
    </div>
  );
};
