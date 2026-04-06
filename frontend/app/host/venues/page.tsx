'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiChevronDown, FiChevronUp, FiShield, FiAlertCircle, FiHome,
} from 'react-icons/fi';
import { venuesAPI, servicesAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import VenueCard from '@/components/VenueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

function HostVenuesContent() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVenue, setExpandedVenue] = useState<number | null>(null);
  const [requirements, setRequirements] = useState<Record<number, any[]>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState('');

  // New requirement form
  const [newReq, setNewReq] = useState({
    service_category: 'cleaning',
    is_mandatory: true,
    description: '',
  });
  const [addingReq, setAddingReq] = useState(false);

  // Load available services for requirements
  const [availableServiceProviders, setAvailableServiceProviders] = useState<any[]>([]);
  const [selectedServiceProviderId, setSelectedServiceProviderId] = useState('');

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const response = await venuesAPI.getMy();
        setVenues(response.data);
      } catch (err) {
        setError('Failed to load your venues.');
      } finally {
        setLoading(false);
      }
    };
    loadVenues();
  }, []);

  const loadRequirements = async (venueId: number) => {
    try {
      const response = await venuesAPI.getRequirements(venueId);
      setRequirements((prev) => ({ ...prev, [venueId]: response.data }));
    } catch (err) {
      console.error('Failed to load requirements:', err);
    }
  };

  const handleExpand = (venueId: number) => {
    if (expandedVenue === venueId) {
      setExpandedVenue(null);
    } else {
      setExpandedVenue(venueId);
      if (!requirements[venueId]) {
        loadRequirements(venueId);
      }
    }
  };

  const handleToggleActive = async (venue: any) => {
    try {
      await venuesAPI.update(venue.id, { is_active: !venue.is_active });
      setVenues((prev) =>
        prev.map((v) => (v.id === venue.id ? { ...v, is_active: !v.is_active } : v))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update venue.');
    }
  };

  const handleDelete = async (venueId: number) => {
    try {
      await venuesAPI.delete(venueId);
      setVenues((prev) => prev.filter((v) => v.id !== venueId));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete venue.');
    }
  };

  const handleSearchProviders = async () => {
    try {
      const response = await servicesAPI.search({ category: newReq.service_category });
      setAvailableServiceProviders(response.data);
    } catch (err) {
      console.error('Failed to search services:', err);
    }
  };

  const handleAddRequirement = async (venueId: number) => {
    if (!selectedServiceProviderId) {
      alert('Please select a service provider.');
      return;
    }
    setAddingReq(true);
    try {
      await venuesAPI.addRequirement(venueId, {
        service_provider_id: Number(selectedServiceProviderId),
        service_category: newReq.service_category,
        is_mandatory: newReq.is_mandatory,
        description: newReq.description,
      });
      await loadRequirements(venueId);
      setNewReq({ service_category: 'cleaning', is_mandatory: true, description: '' });
      setSelectedServiceProviderId('');
      setAvailableServiceProviders([]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add requirement.');
    } finally {
      setAddingReq(false);
    }
  };

  const handleDeleteRequirement = async (venueId: number, reqId: number) => {
    try {
      await venuesAPI.deleteRequirement(venueId, reqId);
      setRequirements((prev) => ({
        ...prev,
        [venueId]: prev[venueId].filter((r: any) => r.id !== reqId),
      }));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete requirement.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your venues..." />;

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title mb-0">My Venues</h1>
          <Link href="/host/venues/create" className="btn-primary flex items-center">
            <FiPlus className="mr-2" /> List New Venue
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {venues.length === 0 ? (
          <EmptyState
            icon={<FiHome size={48} />}
            title="No venues listed yet"
            description="List your first space and start earning from your unique venue!"
            actionLabel="List Your Space"
            actionHref="/host/venues/create"
          />
        ) : (
          <div className="space-y-4">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Venue Summary */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-neutral-900">{venue.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          venue.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {venue.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {venue.venue_type} &middot; {venue.city}, {venue.state} &middot;
                        Up to {venue.capacity} guests &middot; ${venue.price_per_hour}/hr
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/host/venues/create?edit=${venue.id}`}
                        className="p-2 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-neutral-50"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleToggleActive(venue)}
                        className="p-2 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-neutral-50"
                        title={venue.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {venue.is_active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      </button>
                      {deleteConfirm === venue.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(venue.id)}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(venue.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-50"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleExpand(venue.id)}
                        className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-50"
                      >
                        {expandedVenue === venue.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: Requirements */}
                {expandedVenue === venue.id && (
                  <div className="px-5 pb-5 border-t border-neutral-100">
                    <div className="pt-4">
                      <h4 className="font-medium text-neutral-900 mb-3 flex items-center">
                        <FiShield className="mr-2" /> Service Requirements
                      </h4>

                      {/* Existing Requirements */}
                      {requirements[venue.id] && requirements[venue.id].length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {requirements[venue.id].map((req: any) => (
                            <div key={req.id} className="flex items-center justify-between bg-neutral-50 rounded-lg p-3">
                              <div>
                                <span className="capitalize font-medium text-sm">{req.service_category}</span>
                                {req.is_mandatory && (
                                  <span className="ml-2 text-xs text-red-600 font-semibold">Mandatory</span>
                                )}
                                {req.description && (
                                  <p className="text-xs text-neutral-400 mt-0.5">{req.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteRequirement(venue.id, req.id)}
                                className="text-neutral-400 hover:text-red-500"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-400 mb-4">No requirements set.</p>
                      )}

                      {/* Add Requirement Form */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-neutral-700 mb-3">Add Requirement</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-neutral-500 mb-1">Category</label>
                            <select
                              value={newReq.service_category}
                              onChange={(e) => {
                                setNewReq({ ...newReq, service_category: e.target.value });
                                setSelectedServiceProviderId('');
                                setAvailableServiceProviders([]);
                              }}
                              className="input-field text-sm"
                            >
                              <option value="cleaning">Cleaning</option>
                              <option value="security">Security</option>
                              <option value="catering">Catering</option>
                              <option value="bartending">Bartending</option>
                              <option value="dj">DJ</option>
                              <option value="photography">Photography</option>
                              <option value="decoration">Decoration</option>
                              <option value="equipment">Equipment</option>
                              <option value="staff">Staff</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-500 mb-1">Service Provider</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleSearchProviders}
                                className="btn-outline text-sm py-2 px-3 whitespace-nowrap"
                              >
                                Find
                              </button>
                              <select
                                value={selectedServiceProviderId}
                                onChange={(e) => setSelectedServiceProviderId(e.target.value)}
                                className="input-field text-sm"
                              >
                                <option value="">Select provider...</option>
                                {availableServiceProviders.map((sp: any) => (
                                  <option key={sp.id} value={sp.id}>
                                    {sp.service_name} (${sp.hourly_rate}/hr)
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-neutral-500 mb-1">Description (optional)</label>
                            <input
                              type="text"
                              value={newReq.description}
                              onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                              className="input-field text-sm"
                              placeholder="e.g., Must have professional security"
                            />
                          </div>
                          <div className="flex items-end gap-3">
                            <label className="flex items-center gap-2 text-sm text-neutral-700">
                              <input
                                type="checkbox"
                                checked={newReq.is_mandatory}
                                onChange={(e) => setNewReq({ ...newReq, is_mandatory: e.target.checked })}
                                className="rounded border-neutral-300"
                              />
                              Mandatory
                            </label>
                            <button
                              onClick={() => handleAddRequirement(venue.id)}
                              disabled={addingReq}
                              className="btn-primary text-sm py-2"
                            >
                              {addingReq ? 'Adding...' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HostVenuesPage() {
  return (
    <AuthGuard requiredRole="venue_owner">
      <HostVenuesContent />
    </AuthGuard>
  );
}
