'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiX, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { servicesAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function CreateServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    service_name: '',
    service_category: 'cleaning',
    description: '',
    hourly_rate: '',
    minimum_hours: '1',
  });
  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [availability, setAvailability] = useState<Record<string, string>>(
    Object.fromEntries(daysOfWeek.map((d) => [d, 'available']))
  );
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load service data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadService = async () => {
        try {
          const response = await servicesAPI.getById(Number(editId));
          const s = response.data;
          setFormData({
            service_name: s.service_name || '',
            service_category: s.service_category || 'cleaning',
            description: s.description || '',
            hourly_rate: String(s.hourly_rate || ''),
            minimum_hours: String(s.minimum_hours || '1'),
          });
          setCities(s.service_area_cities || []);
          if (s.availability) setAvailability(s.availability);
          setImages(s.images || []);
        } catch (err) {
          setError('Failed to load service for editing.');
        } finally {
          setPageLoading(false);
        }
      };
      loadService();
    }
  }, [editId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCity = () => {
    const trimmed = newCity.trim();
    if (trimmed && !cities.includes(trimmed)) {
      setCities([...cities, trimmed]);
      setNewCity('');
    }
  };

  const removeCity = (index: number) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day] === 'available' ? 'unavailable' : 'available',
    }));
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
      const payload = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        minimum_hours: parseInt(formData.minimum_hours),
        service_area_cities: cities,
        availability,
        images,
      };

      if (isEditMode) {
        await servicesAPI.update(Number(editId), payload);
      } else {
        await servicesAPI.create(payload);
      }
      router.push('/services/my');
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} service.`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner message="Loading service..." />;

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-6">{isEditMode ? 'Edit Service' : 'Create Service Profile'}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Basic Info */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Service Details</h2>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Service Name</label>
              <input
                name="service_name"
                value={formData.service_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Professional DJ Company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select name="service_category" value={formData.service_category} onChange={handleChange} className="input-field">
                <option value="cleaning">Cleaning</option>
                <option value="security">Security</option>
                <option value="catering">Catering</option>
                <option value="bartending">Bartending</option>
                <option value="dj">DJ</option>
                <option value="photography">Photography</option>
                <option value="decoration">Decoration</option>
                <option value="equipment">Equipment</option>
                <option value="staff">Staff</option>
                <option value="other">Other</option>
              </select>
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
                placeholder="Describe your service, experience, and what you offer..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Hourly Rate ($)</label>
                <input
                  name="hourly_rate"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Minimum Hours</label>
                <input
                  name="minimum_hours"
                  type="number"
                  min={1}
                  value={formData.minimum_hours}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Service Areas</h2>
          <div className="mb-8">
            <div className="flex gap-2 mb-3">
              <input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
                className="input-field"
                placeholder="e.g., New York"
              />
              <button type="button" onClick={addCity} className="btn-outline px-3">
                <FiPlus />
              </button>
            </div>
            {cities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cities.map((city, i) => (
                  <span key={i} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {city}
                    <button type="button" onClick={() => removeCity(i)} className="ml-2 text-primary-400 hover:text-primary-600">
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Availability</h2>
          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    availability[day] === 'available'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Portfolio Images</h2>
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
                    <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
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
              {loading ? 'Saving...' : isEditMode ? 'Update Service' : 'Create Service'}
            </button>
            <Link href="/services/my" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateServicePage() {
  return (
    <AuthGuard requiredRole="service_provider">
      <CreateServiceContent />
    </AuthGuard>
  );
}
