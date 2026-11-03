import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ExpiryStatus } from '../types';

interface ExpiryBadgeProps {
  status?: ExpiryStatus;
  timeRemaining?: string;
  showIcon?: boolean;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({
  status = 'fresh',
  timeRemaining,
  showIcon = true,
}) => {
  let label = 'Fresh';
  let badgeClass = 'fresh';
  let IconComponent = CheckCircle;

  if (status === 'expiring_soon') {
    label = 'Expiring Soon';
    badgeClass = 'expiring_soon';
    IconComponent = AlertTriangle;
  } else if (status === 'expired') {
    label = 'Expired';
    badgeClass = 'expired';
    IconComponent = XCircle;
  }

  return (
    <div className={`expiry-badge ${badgeClass}`} title={`Expiry Status: ${label}`}>
      <div className="expiry-badge-primary">
        {status === 'expiring_soon' && (
          <span className="pulse-indicator-vibrant" />
        )}
        {showIcon && <IconComponent size={15} strokeWidth={2.6} className="expiry-badge-icon" />}
        <span className="expiry-badge-label">{label}</span>
      </div>
      {timeRemaining && (
        <span className="expiry-countdown-pill">
          <Clock size={11} strokeWidth={2.4} />
          <span>{timeRemaining}</span>
        </span>
      )}
    </div>
  );
};
