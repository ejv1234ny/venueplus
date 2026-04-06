'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiX, FiPlus, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import { venuesAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import MapView from '@/components/MapView';

function CreateVenueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue_type: 'rooftop',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    capacity: '',
    price_per_hour: '',
    minimum_hours: '1',
    rules: '',
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Geocoding state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState('');
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-geocode when address fields change
  const geocodeAddress = useCallback(async () => {
    const { address, city, state, zip_code } = formData;
    if (!city || !state) return;

    const query = [address, city, state, zip_code].filter(Boolean).join(', ');
    if (query.length < 5) return;

    setGeocoding(true);
    setGeocodeMessage('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        setGeocodeMessage('Location found');
      } else {
        setGeocodeMessage('Could not find location — you can drag the pin to set it manually.');
      }
    } catch {
      setGeocodeMessage('Geocoding failed');
    } finally {
      setGeocoding(false);
    }
  }, [formData]);

  // Debounced geocoding trigger
  useEffect(() => {
    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(() => {
      if (formData.city && formData.state) {
        geocodeAddress();
      }
    }, 800);
    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, [formData.address, formData.city, formData.state, formData.zip_code, geocodeAddress]);

  const handleMarkerDrag = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setGeocodeMessage('Pin moved manually');
  };

  // Load venue data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadVenue = async () => {
        try {
          const response = await venuesAPI.getById(Number(editId));
          const v = response.data;
          setFormData({
            title: v.title || '',
            description: v.description || '',
            venue_type: v.venue_type || 'rooftop',
            address: v.address || '',
            city: v.city || '',
            state: v.state || '',
            zip_code: v.zip_code || '',
            capacity: String(v.capacity || ''),
            price_per_hour: String(v.price_per_hour || ''),
            minimum_hours: String(v.minimum_hours || '1'),
            rules: v.rules || '',
          });
          setAmenities(v.amenities || []);
          setImages(v.images || []);
          if (v.latitude != null) setLatitude(v.latitude);
          if (v.longitude != null) setLongitude(v.longitude);
        } catch (err) {
          setError('Failed to load venue for editing.');
        } finally {
          setPageLoading(false);
        }
      };
      loadVenue();
    }
  }, [editId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addAmenity = () => {
    const trimmed = newAmenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const addImage = () => {
    const trimmed = newImageUrl.trim();
    if (trimmed) {
      setImages([...images, trimmed]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price_per_hour: parseFloat(formData.price_per_hour),
        minimum_hours: parseInt(formData.minimum_hours),
        amenities,
        images,
        latitude: latitude,
        longitude: longitude,
      };

      if (isEditMode) {
        await venuesAPI.update(Number(editId), payload);
      } else {
        await venuesAPI.create(payload);
      }
      router.push('/host/venues');
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} venue.`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner message="Loading venue..." />;

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-6">{isEditMode ? 'Edit Venue' : 'List Your Space'}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Basic Info */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h2>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Downtown Rooftop with City Views"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field"
                placeholder="Describe your space, what makes it unique..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Venue Type</label>
              <select name="venue_type" value={formData.venue_type} onChange={handleChange} className="input-field">
                <option value="rooftop">Rooftop</option>
                <option value="field">Field</option>
                <option value="pool house">Pool House</option>
                <option value="parking lot">Parking Lot</option>
                <option value="warehouse">Warehouse</option>
                <option value="garden">Garden</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Location</h2>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} required className="input-field" placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                <input name="city" value={formData.city} onChange={handleChange} required className="input-field" placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                <input name="state" value={formData.state} onChange={handleChange} required className="input-field" placeholder="NY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Zip Code</label>
                <input name="zip_code" value={formData.zip_code} onChange={handleChange} required className="input-field" placeholder="10001" />
              </div>
            </div>
          </div>

          {/* Location Map Preview */}
          {(latitude !== null && longitude !== null) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                  <FiMapPin size={14} className="text-primary-500" />
                  Confirm Location
                </h3>
                {geocodeMessage && (
                  <span className="text-xs text-neutral-500">{geocodeMessage}</span>
                )}
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-200" style={{ height: 220 }}>
                <MapView
                  venues={[]}
                  center={[latitude, longitude]}
                  zoom={15}
                  interactive={true}
                  singleMarker={{ lat: latitude, lng: longitude }}
                  draggableMarker={true}
                  onMarkerDrag={handleMarkerDrag}
                  height="220px"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">Drag the pin to adjust the exact location</p>
            </div>
          )}
          {geocoding && (
            <div className="mb-8 text-sm text-neutral-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Finding location...
            </div>
          )}

          {/* Details */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Details & Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Capacity (guests)</label>
              <input name="capacity" type="number" min={1} value={formData.capacity} onChange={handleChange} required className="input-field" placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price per Hour ($)</label>
              <input name="price_per_hour" type="number" min={0} step="0.01" value={formData.price_per_hour} onChange={handleChange} required className="input-field" placeholder="150" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Minimum Hours</label>
              <input name="minimum_hours" type="number" min={1} value={formData.minimum_hours} onChange={handleChange} className="input-field" />
            </div>
          </div>

          {/* Amenities */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Amenities</h2>
          <div className="mb-8">
            <div className="flex gap-2 mb-3">
              <input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                className="input-field"
                placeholder="e.g., WiFi, Parking, Sound System"
              />
              <button type="button" onClick={addAmenity} className="btn-outline px-3">
                <FiPlus />
              </button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, i) => (
                  <span key={i} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(i)} className="ml-2 text-primary-400 hover:text-primary-600">
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rules */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">House Rules</h2>
          <div className="mb-8">
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Any rules guests must follow..."
            />
          </div>

          {/* Images */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Images</h2>
          <div className="mb-8">
            <div className="flex gap-2 mb-3">
              <input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
              <button type="button" onClick={addImage} className="btn-outline px-3">
                <FiPlus />
              </button>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Image ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : isEditMode ? 'Update Venue' : 'Create Venue'}
            </button>
            <Link href="/host/venues" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateVenuePage() {
  return (
    <AuthGuard requiredRole="venue_owner">
      <CreateVenueContent />
    </AuthGuard>
  );
}
