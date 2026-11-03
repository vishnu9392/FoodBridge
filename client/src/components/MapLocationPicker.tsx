import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Crosshair, Check, AlertCircle } from 'lucide-react';
import { DonationLocation } from '../types';

interface MapLocationPickerProps {
  location: DonationLocation;
  onChange: (updated: DonationLocation) => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  location,
  onChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [detecting, setDetecting] = useState<boolean>(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const lat = location.coordinates?.latitude || 28.6139; // Default center (e.g. New Delhi or neutral)
  const lng = location.coordinates?.longitude || 77.2090;

  // HTML5 Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      setTimeout(() => setGeoNotice(null), 4000);
      return;
    }

    setDetecting(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetecting(false);
        const detectedLat = Number(position.coords.latitude.toFixed(6));
        const detectedLng = Number(position.coords.longitude.toFixed(6));

        onChange({
          ...location,
          coordinates: {
            latitude: detectedLat,
            longitude: detectedLng,
          },
        });
        setGeoNotice('Current GPS coordinates detected successfully!');
        setTimeout(() => setGeoNotice(null), 4000);
      },
      (err) => {
        setDetecting(false);
        setGeoNotice(`Location detection failed: ${err.message}`);
        setTimeout(() => setGeoNotice(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Google Maps JS API loader if key is provided
  useEffect(() => {
    if (!apiKey || !mapContainerRef.current) return;

    let isMounted = true;
    const scriptId = 'google-maps-script';

    const initMap = () => {
      if (!isMounted || !mapContainerRef.current || !(window as any).google?.maps) return;

      const center = { lat, lng };
      const map = new (window as any).google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 14,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        ],
      });

      const marker = new (window as any).google.maps.Marker({
        position: center,
        map,
        draggable: true,
        animation: (window as any).google.maps.Animation.DROP,
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (pos) {
          onChange({
            ...location,
            coordinates: {
              latitude: Number(pos.lat().toFixed(6)),
              longitude: Number(pos.lng().toFixed(6)),
            },
          });
        }
      });

      map.addListener('click', (e: any) => {
        if (e.latLng) {
          marker.setPosition(e.latLng);
          onChange({
            ...location,
            coordinates: {
              latitude: Number(e.latLng.lat().toFixed(6)),
              longitude: Number(e.latLng.lng().toFixed(6)),
            },
          });
        }
      });
    };

    if (!(window as any).google?.maps) {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      }
    } else {
      initMap();
    }

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  return (
    <div
      className="map-location-picker"
      style={{
        backgroundColor: '#1E1E1E',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-main)',
            }}
          >
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <span>Pickup Address & Location Selection</span>
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Provide your pickup address so recipients can coordinate collection smoothly.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            fontSize: '0.82rem',
          }}
        >
          <Crosshair size={14} className={detecting ? 'animate-spin' : ''} style={{ color: 'var(--primary)' }} />
          <span>{detecting ? 'Detecting...' : 'Detect My Location (GPS)'}</span>
        </button>
      </div>

      {geoNotice && (
        <div
          style={{
            backgroundColor: 'rgba(255, 140, 66, 0.12)',
            border: '1px solid var(--primary)',
            color: '#FFE0B2',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check size={15} style={{ color: 'var(--primary)' }} />
          <span>{geoNotice}</span>
        </div>
      )}

      {/* Structured Address Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="locAddress" style={{ fontSize: '0.84rem' }}>
            Street Address / Building / Door *
          </label>
          <input
            id="locAddress"
            type="text"
            required
            placeholder="e.g., 42 Park Avenue, Door 3B, Kitchen Entry"
            value={location.address || ''}
            onChange={(e) => onChange({ ...location, address: e.target.value })}
            className="form-control"
            style={{
              backgroundColor: '#161616',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.88rem',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="locLocality" style={{ fontSize: '0.84rem' }}>
              Locality / Area
            </label>
            <input
              id="locLocality"
              type="text"
              placeholder="e.g., Downtown, Indiranagar"
              value={location.locality || ''}
              onChange={(e) => onChange({ ...location, locality: e.target.value })}
              className="form-control"
              style={{
                backgroundColor: '#161616',
                color: 'var(--text-main)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="locCity" style={{ fontSize: '0.84rem' }}>
              City *
            </label>
            <input
              id="locCity"
              type="text"
              required
              placeholder="e.g., Mumbai, Bangalore, New York"
              value={location.city || ''}
              onChange={(e) => onChange({ ...location, city: e.target.value })}
              className="form-control"
              style={{
                backgroundColor: '#161616',
                color: 'var(--text-main)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="locState" style={{ fontSize: '0.84rem' }}>
              State / Region
            </label>
            <input
              id="locState"
              type="text"
              placeholder="e.g., Maharashtra, CA"
              value={location.state || ''}
              onChange={(e) => onChange({ ...location, state: e.target.value })}
              className="form-control"
              style={{
                backgroundColor: '#161616',
                color: 'var(--text-main)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="locPostalCode" style={{ fontSize: '0.84rem' }}>
              Postal / PIN Code
            </label>
            <input
              id="locPostalCode"
              type="text"
              placeholder="e.g., 400001, 10001"
              value={location.postalCode || ''}
              onChange={(e) => onChange({ ...location, postalCode: e.target.value })}
              className="form-control"
              style={{
                backgroundColor: '#161616',
                color: 'var(--text-main)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Map Preview or Interactive Picker */}
      <div
        style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          backgroundColor: '#161616',
        }}
      >
        {apiKey ? (
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '220px', backgroundColor: '#181818' }}
          />
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '200px' }}>
            <iframe
              title="Location Picker Map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
              style={{ width: '100%', height: '100%', border: 0, filter: 'contrast(1.05)' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                backgroundColor: 'rgba(18, 18, 18, 0.92)',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span>Pin Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
              <span style={{ color: 'var(--primary)' }}>Auto-synced</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Latitude & Longitude Coordinate Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Latitude Coordinates
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 28.6139"
            value={location.coordinates?.latitude ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange({
                ...location,
                coordinates: {
                  latitude: isNaN(val) ? 0 : val,
                  longitude: location.coordinates?.longitude || 0,
                },
              });
            }}
            className="form-control"
            style={{
              backgroundColor: '#161616',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.84rem',
            }}
          />
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Longitude Coordinates
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 77.2090"
            value={location.coordinates?.longitude ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange({
                ...location,
                coordinates: {
                  latitude: location.coordinates?.latitude || 0,
                  longitude: isNaN(val) ? 0 : val,
                },
              });
            }}
            className="form-control"
            style={{
              backgroundColor: '#161616',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.84rem',
            }}
          />
        </div>
      </div>
    </div>
  );
};
