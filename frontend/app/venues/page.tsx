'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiX, FiMap, FiList, FiRefreshCw } from 'react-icons/fi';
import { venuesAPI } from '@/lib/api';
import VenueCard from '@/components/VenueCard';
import { VenueListSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import MapView, { MapBounds } from '@/components/MapView';
import LocationSearch, { LocationResult } from '@/components/LocationSearch';
import EventTypeSelect from '@/components/EventTypeSelect';

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    venue_type: searchParams.get('type') || '',
    event_type: searchParams.get('event_type') || '',
    min_capacity: '',
    max_price: '',
  });

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [hoveredVenueId, setHoveredVenueId] = useState<number | null>(null);

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Track if user has moved map (vs initial/location-search load)
  const isInitialLoad = useRef(true);
  const pendingBoundsRef = useRef<MapBounds | null>(null);

  const fetchVenues = useCallback(async (bounds?: MapBounds | null) => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filters.venue_type) params.venue_type = filters.venue_type;
      if (filters.event_type) params.event_type = filters.event_type;
      if (filters.min_capacity) params.min_capacity = parseInt(filters.min_capacity);
      if (filters.max_price) params.max_price = parseFloat(filters.max_price);

      // Use bounds if available
      if (bounds) {
        params.sw_lat = bounds.sw_lat;
        params.sw_lng = bounds.sw_lng;
        params.ne_lat = bounds.ne_lat;
        params.ne_lng = bounds.ne_lng;
      }

      const response = await venuesAPI.search(params);
      setVenues(response.data);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load — fetch all venues
  useEffect(() => {
    fetchVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle map bounds change (fires on pan/zoom)
  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
    pendingBoundsRef.current = bounds;

    // Don't show "Search this area" on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    setShowSearchArea(true);
  }, []);

  // Search the visible map area
  const handleSearchArea = () => {
    if (pendingBoundsRef.current) {
      fetchVenues(pendingBoundsRef.current);
      setShowSearchArea(false);
    }
  };

  // Location search — centers the map and fetches for that area
  const handleLocationSelect = (result: LocationResult) => {
    isInitialLoad.current = true; // Don't trigger "search area" for this pan
    setMapCenter([result.lat, result.lon]);

    if (result.boundingbox) {
      // Calculate zoom from bounding box
      const latDiff = result.boundingbox[1] - result.boundingbox[0];
      const lngDiff = result.boundingbox[3] - result.boundingbox[2];
      const maxDiff = Math.max(latDiff, lngDiff);
      let zoom = 12;
      if (maxDiff > 10) zoom = 5;
      else if (maxDiff > 5) zoom = 7;
      else if (maxDiff > 1) zoom = 9;
      else if (maxDiff > 0.5) zoom = 11;
      else if (maxDiff > 0.1) zoom = 13;
      else zoom = 15;
      setMapZoom(zoom);

      // Fetch venues in the bounding box
      const bounds: MapBounds = {
        sw_lat: result.boundingbox[0],
        sw_lng: result.boundingbox[2],
        ne_lat: result.boundingbox[1],
        ne_lng: result.boundingbox[3],
      };
      fetchVenues(bounds);
    } else {
      setMapZoom(13);
      // Small area around the point
      const bounds: MapBounds = {
        sw_lat: result.lat - 0.05,
        sw_lng: result.lon - 0.05,
        ne_lat: result.lat + 0.05,
        ne_lng: result.lon + 0.05,
      };
      fetchVenues(bounds);
    }
    setShowSearchArea(false);
  };

  // Filter submit
  const handleFilterApply = () => {
    if (mapBounds) {
      fetchVenues(mapBounds);
    } else {
      fetchVenues();
    }
    setShowSearchArea(false);
  };

  const handleClearFilters = () => {
    setFilters({ venue_type: '', event_type: '', min_capacity: '', max_price: '' });
    isInitialLoad.current = true;
    setMapCenter([39.8283, -98.5795]);
    setMapZoom(4);
    setShowSearchArea(false);
    fetchVenues();
  };

  // Venue interaction
  const handleVenueClick = (venueId: number) => {
    setSelectedVenueId(venueId);
    // Scroll to the venue card on mobile
    const el = document.getElementById(`venue-card-${venueId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const venuesWithCoords = venues.filter(v => v.latitude != null && v.longitude != null);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Top Bar: Location Search + Filters */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto">
          {/* Location Search + Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Location Search */}
            <div className="sm:w-72 flex-shrink-0">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Search city or location..."
              />
            </div>

            {/* Filters */}
            <div className="flex flex-1 gap-2 items-center flex-wrap">
              <select
                value={filters.venue_type}
                onChange={(e) => setFilters({ ...filters, venue_type: e.target.value })}
                className="input-field py-2 text-sm w-auto min-w-[120px]"
              >
                <option value="">All Types</option>
                <option value="rooftop">Rooftop</option>
                <option value="field">Field</option>
                <option value="pool house">Pool House</option>
                <option value="parking lot">Parking Lot</option>
                <option value="warehouse">Warehouse</option>
                <option value="garden">Garden</option>
              </select>
              <EventTypeSelect
                value={filters.event_type}
                onChange={(v) => setFilters({ ...filters, event_type: v })}
                placeholder="Any occasion"
                aria-label="Filter by event type"
                className="input-field py-2 text-sm w-auto min-w-[140px]"
              />
              <input
                type="number"
                placeholder="Min Guests"
                value={filters.min_capacity}
                onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value })}
                className="input-field py-2 text-sm w-28"
              />
              <input
                type="number"
                placeholder="Max $/hr"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                className="input-field py-2 text-sm w-28"
              />
              <button onClick={handleFilterApply} className="btn-primary py-2 px-4 text-sm">
                <FiSearch className="inline mr-1" size={14} /> Filter
              </button>
              <button onClick={handleClearFilters} className="btn-outline py-2 px-3 text-sm">
                <FiX size={14} />
              </button>
            </div>

            {/* Mobile view toggle */}
            <div className="flex sm:hidden gap-1">
              <button
                onClick={() => setMobileView('list')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                  mobileView === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <FiList size={14} /> List
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                  mobileView === 'map'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <FiMap size={14} /> Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Split Content: List | Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Venue List (scrollable) */}
        <div
          className={`w-full sm:w-1/2 lg:w-[480px] xl:w-[560px] flex-shrink-0 overflow-y-auto bg-neutral-50 ${
            mobileView === 'map' ? 'hidden sm:block' : ''
          }`}
        >
          <div className="p-4">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500">
                {loading ? 'Searching...' : `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`}
                {venuesWithCoords.length > 0 && venuesWithCoords.length < venues.length && (
                  <span className="text-neutral-400"> ({venuesWithCoords.length} on map)</span>
                )}
              </p>
            </div>

            {/* Venue Cards */}
            {loading ? (
              <VenueListSkeleton />
            ) : venues.length === 0 ? (
              <EmptyState
                icon={<FiSearch size={48} />}
                title="No venues found"
                description="Try adjusting your filters, searching a different location, or zooming out on the map."
              />
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    id={`venue-card-${venue.id}`}
                    onMouseEnter={() => setHoveredVenueId(venue.id)}
                    onMouseLeave={() => setHoveredVenueId(null)}
                    className={`rounded-xl transition-all duration-200 ${
                      selectedVenueId === venue.id
                        ? 'ring-2 ring-accent-500 shadow-lg'
                        : hoveredVenueId === venue.id
                        ? 'ring-1 ring-primary-300'
                        : ''
                    }`}
                  >
                    <VenueCard venue={venue} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Map (sticky) */}
        <div
          className={`flex-1 relative ${
            mobileView === 'list' ? 'hidden sm:block' : ''
          }`}
        >
          <MapView
            venues={venues}
            center={mapCenter}
            zoom={mapZoom}
            onBoundsChange={handleBoundsChange}
            onVenueClick={handleVenueClick}
            selectedVenueId={selectedVenueId}
            hoveredVenueId={hoveredVenueId}
          />

          {/* "Search this area" button */}
          {showSearchArea && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
              <button
                onClick={handleSearchArea}
                className="bg-white shadow-lg rounded-full px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 border border-neutral-200 flex items-center gap-2 transition-all"
              >
                <FiRefreshCw size={14} />
                Search this area
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
