import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { DonationLocation } from '../types';

interface MapPreviewProps {
  location: DonationLocation;
  title?: string;
  isExact?: boolean;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  location,
  title = 'Pickup Location',
  isExact = false,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasCoords =
    location?.coordinates &&
    typeof location.coordinates.latitude === 'number' &&
    typeof location.coordinates.longitude === 'number' &&
    !isNaN(location.coordinates.latitude) &&
    !isNaN(location.coordinates.longitude);

  const destinationQuery = hasCoords
    ? `${location.coordinates!.latitude},${location.coordinates!.longitude}`
    : encodeURIComponent(
        `${location.address ? location.address + ', ' : ''}${location.locality ? location.locality + ', ' : ''}${location.city || ''}`
      );

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;

  // Embed URL for map preview: if API key exists, use Google Maps Embed API; otherwise, use OpenStreetMap embed
  let embedUrl = '';
  if (apiKey) {
    embedUrl = hasCoords
      ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${location.coordinates!.latitude},${location.coordinates!.longitude}&zoom=14`
      : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent((location.locality ? location.locality + ', ' : '') + location.city)}&zoom=13`;
  } else if (hasCoords) {
    const lat = location.coordinates!.latitude;
    const lng = location.coordinates!.longitude;
    embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.015}%2C${lng + 0.015}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`;
  } else {
    // City center fallback
    embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent((location.locality ? location.locality + ', ' : '') + location.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }

  return (
    <div
      className="map-preview-card"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        backgroundColor: '#1E1E1E',
      }}
    >
      <div
        style={{
          height: '160px',
          width: '100%',
          backgroundColor: '#181818',
          position: 'relative',
        }}
      >
        <iframe
          title={`Map location for ${title}`}
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            filter: 'contrast(1.05) opacity(0.9)',
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {!isExact && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(18, 18, 18, 0.88)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(4px)',
            }}
          >
            Approximate Area (Privacy Protected)
          </div>
        )}
      </div>

      <div
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {location.locality
                ? `${location.locality}, ${location.city}`
                : location.city || 'Pickup Location'}
            </span>
          </div>
          {isExact && location.address && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '1.35rem', marginTop: '0.15rem' }}>
              {location.address}
            </div>
          )}
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            fontSize: '0.82rem',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <Navigation size={13} />
          <span>Get Directions</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
