import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Info,
  UploadCloud,
  Camera,
  X,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { donationService } from '../services/donationService';
import { FoodCategory, QuantityUnit, DonationLocation } from '../types';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapLocationPicker } from '../components/MapLocationPicker';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Nut-Free',
  'Dairy-Free',
  'Contains Soy',
  'Perishable',
];

export const DonateFoodPage: React.FC = () => {
  const { user, isDonor } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper: default prep to now, expiry to 24 hours from now
  const defaultPrep = new Date().toISOString().slice(0, 16);
  const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [quantity, setQuantity] = useState<string>('15');
  const [unit, setUnit] = useState<QuantityUnit>('portions');
  const [prepDate, setPrepDate] = useState<string>(defaultPrep);
  const [expiryDate, setExpiryDate] = useState<string>(defaultExpiry);
  const [locationState, setLocationState] = useState<DonationLocation>({
    address: user?.address || '',
    locality: '',
    city: 'Downtown',
    state: '',
    postalCode: '',
    landmark: '',
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090,
    },
  });
  const [description, setDescription] = useState<string>('');

  // Image Upload State (NO demo URLs or presets)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [selectedDietary, setSelectedDietary] = useState<string[]>(['Vegetarian']);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const toggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  // Handle File Upload from device (Gallery / Camera / Files)
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!foodName.trim()) {
      setError('Food name is required.');
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please provide a valid quantity greater than 0.');
      return;
    }

    const prep = new Date(prepDate);
    const exp = new Date(expiryDate);

    if (isNaN(prep.getTime())) {
      setError('Please provide a valid preparation date and time.');
      return;
    }

    if (isNaN(exp.getTime())) {
      setError('Please provide a valid expiry date and time.');
      return;
    }

    if (exp.getTime() <= prep.getTime()) {
      setError('Food expiry date and time must be strictly after the preparation time.');
      return;
    }

    if (!locationState.address.trim() || !locationState.city.trim()) {
      setError('Pickup street address and city are required for recipient logistics.');
      return;
    }

    setSubmitting(true);
    try {
      await donationService.createDonation({
        foodName: foodName.trim(),
        category,
        quantity: qty,
        unit,
        prepDate: prep.toISOString(),
        expiryDate: exp.toISOString(),
        location: locationState,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        dietaryInfo: selectedDietary,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/available-food');
      }, 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="container main-content" style={{ paddingBottom: '4rem' }}>
      <div className="donate-form-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="heading-serif" style={{ fontSize: '2.2rem' }}>
            List Surplus Food Donation
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Empower local relief networks by registering edible surplus before shelf life expires.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>Food donation posted to the community ledger successfully! Redirecting...</span>
          </div>
        )}

        {!isDonor && (
          <div className="alert alert-info">
            <Info size={16} />
            <span>
              Note: You are currently logged in as a <strong>{user?.role}</strong>. Posting donations is primarily designed for registered food donors.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Food Details */}
          <div className="form-group">
            <label className="form-label" htmlFor="foodName">Food Item Name *</label>
            <input
              id="foodName"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Steamed Basmati Rice & Lentil Curry, Fresh Baguettes"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="foodCategory">Category *</label>
              <select
                id="foodCategory"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Packaged & Canned">Packaged & Canned</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                type="number"
                step="any"
                min="0.1"
                required
                className="form-input"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="unit">Unit of Measure *</label>
              <select
                id="unit"
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as QuantityUnit)}
              >
                <option value="portions">portions / servings</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="boxes">boxes / crates</option>
                <option value="items">items / packets</option>
                <option value="litres">litres</option>
              </select>
            </div>
          </div>

          {/* Time & Expiry Tracking */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="prepDate">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Preparation Date & Time *
                </span>
              </label>
              <input
                id="prepDate"
                type="datetime-local"
                required
                className="form-input"
                value={prepDate}
                onChange={(e) => setPrepDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expiryDate">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} style={{ color: 'var(--soon-yellow)' }} />
                  Estimated Safe Expiry *
                </span>
              </label>
              <input
                id="expiryDate"
                type="datetime-local"
                required
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Pickup Address & Location Selection with Google Maps Integration */}
          <div style={{ marginBottom: '1.5rem' }}>
            <MapLocationPicker
              location={locationState}
              onChange={setLocationState}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              <span>Food Description & Storage Instructions</span>
              <span className="form-hint">(Packaging, refrigeration notes)</span>
            </label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="E.g., Packed in stainless steel hot food containers. Keep refrigerated below 4°C until distribution."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* REAL FOOD IMAGE UPLOAD (No demo presets) */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={16} style={{ color: 'var(--primary)' }} />
                  <span>Food Image</span>
                </span>
                <span className="form-hint" style={{ marginLeft: '0.5rem' }}>Upload actual photo of the food batch</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  textDecoration: 'underline',
                }}
              >
                <LinkIcon size={12} />
                <span>{showUrlInput ? 'Switch to File Upload' : 'Or paste image link'}</span>
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {/* Active Image Preview if selected */}
            {imagePreview ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '2px solid var(--primary)',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: '#161619',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Food upload preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    display: 'flex',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ backgroundColor: 'rgba(20,20,24,0.85)', backdropFilter: 'blur(6px)' }}
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-danger btn-sm"
                    style={{ backgroundColor: 'rgba(231,76,60,0.85)', backdropFilter: 'blur(6px)' }}
                    title="Remove image"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '0.75rem',
                    backgroundColor: 'rgba(10,10,12,0.85)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--fresh-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <CheckCircle size={13} />
                  <span>Photo Ready for Listing</span>
                </div>
              </div>
            ) : showUrlInput ? (
              /* Alternate clean URL input (empty by default) */
              <div>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/your-food-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value.trim() ? e.target.value : null);
                  }}
                />
                <span className="form-hint" style={{ marginTop: '0.3rem', display: 'block' }}>
                  Paste a direct link to your food picture, or switch back to upload from your phone or PC.
                </span>
              </div>
            ) : (
              /* Drag and Drop File Upload Area */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border-medium)',
                  backgroundColor: isDragging ? 'var(--primary-subtle)' : 'var(--bg-input)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    marginBottom: '1rem',
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                  Click to Browse or Drag & Drop Food Photo
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Supports PNG, JPG, JPEG, WEBP up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Dietary / Allergen Tags */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Dietary & Allergen Details</label>
            <div className="dietary-options-grid">
              {DIETARY_OPTIONS.map((tag) => (
                <label key={tag} className="dietary-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedDietary.includes(tag)}
                    onChange={() => toggleDietary(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Registering Food on FoodBridge...' : 'Publish Food Donation'}
          </button>
        </form>
      </div>
    </div>
  );
};
