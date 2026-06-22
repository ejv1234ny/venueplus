'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  FiCalendar, FiMapPin, FiDollarSign, FiClock,
  FiChevronDown, FiChevronUp, FiXCircle,
} from 'react-icons/fi';
import { bookingsAPI, venuesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';
import Alert from '@/components/Alert';

const statusFilters = ['all', 'awaiting_payment', 'pending', 'confirmed', 'completed', 'cancelled'];

function BookingsContent() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [venueMap, setVenueMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await bookingsAPI.getMy();
        const data = response.data;
        setBookings(data);

        // Fetch venue names for all bookings
        const venueIds = Array.from(new Set(data.map((b: any) => b.venue_id)));
        const venueResponses = await Promise.all(
          venueIds.map((id: any) => venuesAPI.getById(id).catch(() => null))
        );
        const map: Record<number, any> = {};
        venueResponses.forEach((res) => {
          if (res?.data) map[res.data.id] = res.data;
        });
        setVenueMap(map);
      } catch (err) {
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelLoading(bookingId);
    try {
      await bookingsAPI.cancel(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      toast.success('Booking cancelled');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(null);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  if (loading) return <LoadingSpinner message="Loading your bookings..." />;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-6">My Bookings</h1>

        {error && <Alert variant="error" className="mb-6">{error}</Alert>}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {s}
              {s !== 'all' && (
                <span className="ml-1">({bookings.filter((b) => b.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon={<FiCalendar size={48} />}
            title={filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            description={filter === 'all' ? 'Browse venues and book your first event space!' : 'Try a different filter.'}
            actionLabel={filter === 'all' ? 'Browse Venues' : undefined}
            actionHref={filter === 'all' ? '/venues' : undefined}
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const venue = venueMap[booking.venue_id];
              const isExpanded = expandedBooking === booking.id;

              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Booking Header */}
                  <button
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-neutral-900">
                          {venue ? venue.title : `Venue #${booking.venue_id}`}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" size={14} />
                          {format(new Date(booking.start_datetime), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <FiClock className="mr-1" size={14} />
                          {booking.total_hours}h
                        </span>
                        <span className="flex items-center font-medium text-primary-600">
                          <FiDollarSign className="mr-0.5" size={14} />
                          {booking.total_cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-neutral-100">
                      <div className="pt-4 space-y-3 text-sm">
                        {venue && (
                          <div className="flex items-center text-neutral-500">
                            <FiMapPin className="mr-2" size={14} />
                            <span>{venue.city}, {venue.state}</span>
                            <Link href={`/venues/${venue.id}`} className="ml-auto text-primary-600 hover:underline">
                              View Venue
                            </Link>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Time</span>
                          <span>
                            {format(new Date(booking.start_datetime), 'h:mm a')} - {format(new Date(booking.end_datetime), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Venue Cost</span>
                          <span>${booking.venue_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Service Cost</span>
                          <span>${booking.service_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-neutral-100">
                          <span>Total</span>
                          <span className="text-primary-600">${booking.total_cost.toFixed(2)}</span>
                        </div>

                        {booking.special_requests && (
                          <div className="pt-2">
                            <span className="text-neutral-500">Special Requests:</span>
                            <p className="text-neutral-700 mt-1">{booking.special_requests}</p>
                          </div>
                        )}

                        {/* Booked Services */}
                        {booking.booked_services && booking.booked_services.length > 0 && (
                          <div className="pt-2">
                            <span className="text-neutral-500 font-medium">Services:</span>
                            <div className="mt-2 space-y-2">
                              {booking.booked_services.map((bs: any) => (
                                <div key={bs.id} className="flex items-center justify-between bg-neutral-50 rounded-lg p-2">
                                  <div>
                                    <span className="font-medium">Service #{bs.service_provider_id}</span>
                                    {bs.is_mandatory && (
                                      <span className="ml-2 text-xs text-red-600 font-semibold">Required</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <StatusBadge status={bs.status} />
                                    <span className="font-medium">${bs.cost.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pay Now CTA — most prominent action when payment is owed */}
                        {booking.status === 'awaiting_payment' && (
                          <div className="pt-3">
                            <Link
                              href={`/checkout/${booking.id}`}
                              className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg shadow-sm"
                            >
                              Pay now — ${booking.total_cost.toFixed(2)}
                            </Link>
                            <p className="text-xs text-neutral-500 mt-2 text-center">
                              Your booking will be sent to the host once payment is authorized.
                            </p>
                          </div>
                        )}

                        {/* Cancel Button */}
                        {(booking.status === 'pending' || booking.status === 'awaiting_payment' || booking.status === 'confirmed') && (
                          <div className="pt-3">
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancelLoading === booking.id}
                              className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              <FiXCircle className="mr-1" />
                              {cancelLoading === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <AuthGuard>
      <BookingsContent />
    </AuthGuard>
  );
}
