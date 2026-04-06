'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Types
export interface MapBounds {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
}

export interface MapVenue {
  id: number;
  title: string;
  latitude: number | null;
  longitude: number | null;
  price_per_hour: number;
  venue_type: string;
  city: string;
  state: string;
}

interface MapViewProps {
  venues: MapVenue[];
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: MapBounds) => void;
  onVenueClick?: (venueId: number) => void;
  selectedVenueId?: number | null;
  hoveredVenueId?: number | null;
  height?: string;
  interactive?: boolean;
  singleMarker?: { lat: number; lng: number };
  draggableMarker?: boolean;
  onMarkerDrag?: (lat: number, lng: number) => void;
}

// Inner map component - only loaded client-side
function MapInner({
  venues,
  center = [39.8283, -98.5795],
  zoom = 4,
  onBoundsChange,
  onVenueClick,
  selectedVenueId,
  hoveredVenueId,
  height = '100%',
  interactive = true,
  singleMarker,
  draggableMarker = false,
  onMarkerDrag,
}: MapViewProps) {
  const L = require('leaflet');
  const { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } = require('react-leaflet');

  // Fix Leaflet default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, [L]);

  // Custom icons
  const defaultIcon = useMemo(() => new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }), [L]);

  const activeIcon = useMemo(() => new L.DivIcon({
    className: 'custom-marker-active',
    html: `<div style="
      background: #ff6946;
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">V</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }), [L]);

  // Component to handle map events (bounds change)
  function MapEvents() {
    useMapEvents({
      moveend: (e: any) => {
        if (onBoundsChange) {
          const map = e.target;
          const bounds = map.getBounds();
          onBoundsChange({
            sw_lat: bounds.getSouthWest().lat,
            sw_lng: bounds.getSouthWest().lng,
            ne_lat: bounds.getNorthEast().lat,
            ne_lng: bounds.getNorthEast().lng,
          });
        }
      },
    });
    return null;
  }

  // Component to update map center/zoom when props change
  function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
  }

  // Draggable marker component
  function DraggableMarkerComponent({ position, onDrag }: { position: [number, number]; onDrag?: (lat: number, lng: number) => void }) {
    const React = require('react');
    const markerRef = React.useRef(null) as any;

    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker && onDrag) {
          const pos = marker.getLatLng();
          onDrag(pos.lat, pos.lng);
        }
      },
    }), [onDrag]);

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={activeIcon}
      >
        <Popup>Drag to adjust location</Popup>
      </Marker>
    );
  }

  const mappableVenues = venues.filter(
    (v) => v.latitude != null && v.longitude != null
  );

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        doubleClickZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {interactive && <MapEvents />}
        <MapUpdater center={center} zoom={zoom} />

        {/* Single marker mode (for venue detail / create) */}
        {singleMarker && !draggableMarker && (
          <Marker position={[singleMarker.lat, singleMarker.lng]} icon={activeIcon}>
            <Popup>Venue Location</Popup>
          </Marker>
        )}

        {singleMarker && draggableMarker && (
          <DraggableMarkerComponent
            position={[singleMarker.lat, singleMarker.lng]}
            onDrag={onMarkerDrag}
          />
        )}

        {/* Multi-venue markers */}
        {!singleMarker && mappableVenues.map((venue) => {
          const isActive = venue.id === selectedVenueId || venue.id === hoveredVenueId;
          return (
            <Marker
              key={venue.id}
              position={[venue.latitude!, venue.longitude!]}
              icon={isActive ? activeIcon : defaultIcon}
              eventHandlers={{
                click: () => onVenueClick?.(venue.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <strong style={{ fontSize: 14 }}>{venue.title}</strong>
                  <br />
                  <span style={{ color: '#666', fontSize: 12 }}>
                    {venue.city}, {venue.state}
                  </span>
                  <br />
                  <span style={{ color: '#007db1', fontWeight: 'bold', fontSize: 14 }}>
                    ${venue.price_per_hour}/hr
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Dynamic import wrapper - prevents SSR issues with Leaflet
const MapView = dynamic(() => Promise.resolve(MapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
      <div className="text-neutral-400 text-sm">Loading map...</div>
    </div>
  ),
});

export default MapView;
