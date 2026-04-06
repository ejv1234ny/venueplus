'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FiMapPin, FiUsers, FiDollarSign, FiClock, FiCheckCircle,
  FiAlertCircle, FiShield, FiPlus, FiX, FiCalendar,
} from 'react-icons/fi';
import { venuesAPI, servicesAPI, bookingsAPI, eventsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import MapView from '@/components/MapView';

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = Number(params.id);
  const { isAuthenticated, user } = useAuthStore();

  // Venue data
  const [venue, setVenue] = useState<any>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [requirementServices, setRequirementServices] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking form
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedServices, setSelectedServices] = useState<Array<{
    service_provider_id: number;
    hours: number;
    is_mandatory: boolean;
    notes: string;
    service_info?: any;
  }>>([]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [userEvents, setUserEvents] = useState<any[]>([]);

  // Optional service search
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [serviceSearchCategory, setServiceSearchCategory] = useState('');
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [searchingServices, setSearchingServices] = useState(false);

  // Booking state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Load venue data
  useEffect(() => {
    const loadVenue = async () => {
      try {
        const [venueRes, reqRes] = await Promise.all([
          venuesAPI.getById(venueId),
          venuesAPI.getRequirements(venueId),
        ]);
        setVenue(venueRes.data);
        setRequirements(reqRes.data);

        // Load service provider details for each requirement
        if (reqRes.data.length > 0) {
          const serviceIds = Array.from(new Set(reqRes.data.map((r: any) => r.service_provider_id)));
          const serviceResponses = await Promise.all(
            serviceIds.map((id: any) => servicesAPI.getById(id).catch(() => null))
          );
          const serviceMap: Record<number, any> = {};
          serviceResponses.forEach((res) => {
            if (res?.data) serviceMap[res.data.id] = res.data;
          });
          setRequirementServices(serviceMap);

          // Pre-populate mandatory services
          const mandatoryServices = reqRes.data
            .filter((r: any) => r.is_mandatory)
            .map((r: any) => ({
              service_provider_id: r.service_provider_id,
              hours: 0, // will be set when dates are picked
              is_mandatory: true,
              notes: '',
              service_info: serviceMap[r.service_provider_id],
            }));
          setSelectedServices(mandatoryServices);
        }
      } catch (err: any) {
        setError('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };
    loadVenue();
  }, [venueId]);

  // Load user events if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      eventsAPI.getMy().then((res) => setUserEvents(res.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  // Calculate hours and costs
  const totalHours = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)))
    : 0;
  const venueCost = venue ? totalHours * venue.price_per_hour : 0;

  // Update mandatory service hours when dates change
  useEffect(() => {
    if (totalHours > 0) {
      setSelectedServices((prev) =>
        prev.map((s) => (s.is_mandatory ? { ...s, hours: totalHours } : s))
      );
    }
  }, [totalHours]);

  const serviceCost = selectedServices.reduce((sum, s) => {
    const rate = s.service_info?.hourly_rate || 0;
    return sum + s.hours * rate;
  }, 0);
  const totalCost = venueCost + serviceCost;

  // Search optional services
  const handleSearchServices = async () => {
    setSearchingServices(true);
    try {
      const params: any = {};
      if (serviceSearchCategory) params.category = serviceSearchCategory;
      const response = await servicesAPI.search(params);
      // Filter out already-selected services
      const selectedIds = new Set(selectedServices.map((s) => s.service_provider_id));
      setAvailableServices(response.data.filter((s: any) => !selectedIds.has(s.id)));
    } catch (err) {
      console.error('Failed to search services:', err);
    } finally {
      setSearchingServices(false);
    }
  };

  const addOptionalService = (service: any) => {
    setSelectedServices((prev) => [
      ...prev,
      {
        service_provider_id: service.id,
        hours: totalHours || 1,
        is_mandatory: false,
        notes: '',
        service_info: service,
      },
    ]);
    setAvailableServices((prev) => prev.filter((s) => s.id !== service.id));
  };

  const removeOptionalService = (serviceProviderId: number) => {
    setSelectedServices((prev) => prev.filter(
      (s) => !(s.service_provider_id === serviceProviderId && !s.is_mandatory)
    ));
  };

  const updateServiceHours = (serviceProviderId: number, hours: number) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service_provider_id === serviceProviderId ? { ...s, hours: Math.max(1, hours) } : s
      )
    );
  };

  const updateServiceNotes = (serviceProviderId: number, notes: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service_provider_id === serviceProviderId ? { ...s, notes } : s
      )
    );
  };

  // Submit booking
  const handleBooking = async () => {
    setBookingError('');

    if (!startDate || !endDate) {
      setBookingError('Please select start and end dates.');
      return;
    }
    if (totalHours < (venue?.minimum_hours || 1)) {
      setBookingError(`Minimum booking duration is ${venue.minimum_hours} hour(s).`);
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData: any = {
        venue_id: venueId,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        special_requests: specialRequests || undefined,
        services: selectedServices.map((s) => ({
          service_provider_id: s.service_provider_id,
          hours: s.hours,
          is_mandatory: s.is_mandatory,
          notes: s.notes || undefined,
        })),
      };
      if (selectedEventId) bookingData.event_id = Number(selectedEventId);

      const response = await bookingsAPI.create(bookingData);
      setBookingSuccess(response.data);
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading venue..." />;
  if (error || !venue) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{error || 'Venue not found.'}</p>
        <Link href="/venues" className="btn-primary mt-4 inline-block">Back to Venues</Link>
      </div>
    );
  }

  // Booking success screen
  if (bookingSuccess) {
    return (
      <div className="py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed!</h1>
          <p className="text-neutral-600 mb-6">
            Your booking for <strong>{venue.title}</strong> has been submitted. Booking #{bookingSuccess.id}
          </p>
          <div className="bg-white rounded-xl shadow-sm p-6 text-left mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <StatusBadge status={bookingSuccess.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Hours</span>
                <span className="font-medium">{bookingSuccess.total_hours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Venue Cost</span>
                <span className="font-medium">${bookingSuccess.venue_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Service Cost</span>
                <span className="font-medium">${bookingSuccess.service_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-100">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-primary-600">${bookingSuccess.total_cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/bookings" className="btn-primary">View My Bookings</Link>
            <Link href="/venues" className="btn-outline">Browse More Venues</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="rounded-xl overflow-hidden mb-8">
          {venue.images && venue.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-64 md:h-96">
              <img src={venue.images[0]} alt={venue.title} className="w-full h-full object-cover" />
              {venue.images.length > 1 && (
                <div className="hidden md:grid grid-cols-2 gap-2">
                  {venue.images.slice(1, 5).map((img: string, i: number) => (
                    <img key={i} src={img} alt={`${venue.title} ${i + 2}`} className="w-full h-full object-cover" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 md:h-80 bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
              <span className="text-white text-6xl font-bold opacity-30">V+</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Venue Info */}
          <div className="lg:col-span-2">
            {/* Title & Location */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full capitalize mb-2">
                    {venue.venue_type}
                  </span>
                  <h1 className="text-3xl font-bold text-neutral-900">{venue.title}</h1>
                </div>
              </div>
              <div className="flex items-center text-neutral-500 mt-2">
                <FiMapPin className="mr-2" />
                <span>{venue.address}, {venue.city}, {venue.state} {venue.zip_code}</span>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <FiUsers className="mx-auto mb-1 text-primary-500" size={20} />
                <p className="text-sm text-neutral-500">Capacity</p>
                <p className="font-semibold">{venue.capacity}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <FiDollarSign className="mx-auto mb-1 text-primary-500" size={20} />
                <p className="text-sm text-neutral-500">Per Hour</p>
                <p className="font-semibold">${venue.price_per_hour}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <FiClock className="mx-auto mb-1 text-primary-500" size={20} />
                <p className="text-sm text-neutral-500">Minimum</p>
                <p className="font-semibold">{venue.minimum_hours}h</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <FiCheckCircle className="mx-auto mb-1 text-primary-500" size={20} />
                <p className="text-sm text-neutral-500">Status</p>
                <p className="font-semibold">{venue.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">About This Space</h2>
              <p className="text-neutral-600 whitespace-pre-line">{venue.description}</p>
            </div>

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity: string, i: number) => (
                    <span key={i} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {venue.rules && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-3">House Rules</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-neutral-700 whitespace-pre-line">{venue.rules}</p>
                </div>
              </div>
            )}

            {/* Location Map */}
            {venue.latitude && venue.longitude && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                  <FiMapPin className="inline mr-2" />
                  Location
                </h2>
                <div className="rounded-xl overflow-hidden border border-neutral-200" style={{ height: 280 }}>
                  <MapView
                    venues={[]}
                    center={[venue.latitude, venue.longitude]}
                    zoom={15}
                    interactive={false}
                    singleMarker={{ lat: venue.latitude, lng: venue.longitude }}
                    height="280px"
                  />
                </div>
              </div>
            )}

            {/* Required Services */}
            {requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                  <FiShield className="inline mr-2" />
                  Required Services
                </h2>
                <div className="space-y-3">
                  {requirements.map((req: any) => {
                    const svc = requirementServices[req.service_provider_id];
                    return (
                      <div key={req.id} className="bg-white border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize font-medium">{req.service_category}</span>
                            {req.is_mandatory && (
                              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                Mandatory
                              </span>
                            )}
                          </div>
                          {svc && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {svc.service_name} - ${svc.hourly_rate}/hr
                            </p>
                          )}
                          {req.description && (
                            <p className="text-sm text-neutral-400 mt-1">{req.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                ${venue.price_per_hour} <span className="text-sm font-normal text-neutral-500">/hour</span>
              </h2>

              {!isAuthenticated ? (
                <div className="mt-4">
                  <p className="text-neutral-600 text-sm mb-4">Log in to book this venue.</p>
                  <Link href={`/login`} className="btn-primary w-full text-center block">
                    Log In to Book
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Date Pickers */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      <FiCalendar className="inline mr-1" /> Start Date & Time
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      showTimeSelect
                      dateFormat="MMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      className="input-field w-full"
                      placeholderText="Select start time"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      <FiCalendar className="inline mr-1" /> End Date & Time
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      showTimeSelect
                      dateFormat="MMM d, yyyy h:mm aa"
                      minDate={startDate || new Date()}
                      className="input-field w-full"
                      placeholderText="Select end time"
                    />
                  </div>

                  {totalHours > 0 && (
                    <p className="text-sm text-neutral-500">Duration: {totalHours} hour{totalHours !== 1 ? 's' : ''}</p>
                  )}

                  {/* Event Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Event (optional)</label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
                      className="input-field"
                    >
                      <option value="">No event</option>
                      {userEvents.map((evt: any) => (
                        <option key={evt.id} value={evt.id}>{evt.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Services */}
                  {selectedServices.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 mb-2">Services</h3>
                      <div className="space-y-2">
                        {selectedServices.map((s) => (
                          <div key={s.service_provider_id} className="bg-neutral-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {s.service_info?.service_name || `Service #${s.service_provider_id}`}
                              </span>
                              {s.is_mandatory ? (
                                <span className="text-xs text-red-600 font-semibold">Required</span>
                              ) : (
                                <button
                                  onClick={() => removeOptionalService(s.service_provider_id)}
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  <FiX size={14} />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <label className="text-neutral-500">Hours:</label>
                              <input
                                type="number"
                                min={1}
                                value={s.hours}
                                onChange={(e) => updateServiceHours(s.service_provider_id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 border border-neutral-200 rounded text-center text-sm"
                                disabled={s.is_mandatory}
                              />
                              <span className="text-neutral-500">
                                = ${((s.service_info?.hourly_rate || 0) * s.hours).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Optional Services */}
                  <div>
                    {!showServiceSearch ? (
                      <button
                        onClick={() => { setShowServiceSearch(true); handleSearchServices(); }}
                        className="text-primary-600 text-sm font-medium flex items-center hover:text-primary-700"
                      >
                        <FiPlus className="mr-1" /> Add Optional Services
                      </button>
                    ) : (
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Find Services</span>
                          <button onClick={() => setShowServiceSearch(false)} className="text-neutral-400 hover:text-neutral-600">
                            <FiX size={14} />
                          </button>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <select
                            value={serviceSearchCategory}
                            onChange={(e) => setServiceSearchCategory(e.target.value)}
                            className="input-field text-sm py-2"
                          >
                            <option value="">All Categories</option>
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
                          <button onClick={handleSearchServices} className="btn-primary text-sm py-2 px-3">
                            Search
                          </button>
                        </div>
                        {searchingServices ? (
                          <p className="text-sm text-neutral-500">Searching...</p>
                        ) : availableServices.length === 0 ? (
                          <p className="text-sm text-neutral-500">No services found.</p>
                        ) : (
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {availableServices.map((svc) => (
                              <button
                                key={svc.id}
                                onClick={() => addOptionalService(svc)}
                                className="w-full text-left p-2 rounded hover:bg-white text-sm flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-medium">{svc.service_name}</span>
                                  <span className="text-neutral-400 ml-1 capitalize">({svc.service_category})</span>
                                </div>
                                <span className="text-primary-600 font-medium">${svc.hourly_rate}/hr</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="input-field text-sm"
                      rows={2}
                      placeholder="Any special requirements..."
                    />
                  </div>

                  {/* Cost Summary */}
                  {totalHours > 0 && (
                    <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">
                          ${venue.price_per_hour} x {totalHours} hr{totalHours !== 1 ? 's' : ''}
                        </span>
                        <span>${venueCost.toFixed(2)}</span>
                      </div>
                      {serviceCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Services</span>
                          <span>${serviceCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-200">
                        <span>Total</span>
                        <span className="text-primary-600">${totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                      <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                      <p className="text-red-700 text-sm">{bookingError}</p>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || !startDate || !endDate}
                    className="btn-accent w-full text-center"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
