'use client';

import 'leaflet/dist/leaflet.css';   // MUST load or tiles render as scattered squares
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
  fitKey?: number;   // bump to re-fit the map to current venue markers
}

// ---------------------------------------------------------------------------
// Helper components — defined at MODULE scope (NOT inside MapInner). If these
// live inside MapInner they get a new identity every render, so React remounts
// them and re-runs their effects (setView / fitBounds / invalidateSize); those
// fire Leaflet 'moveend' -> onBoundsChange -> setState -> re-render -> remount,
// an infinite loop that makes the map/markers blink wildly. Module scope = stable
// identity = effects run once (plus on real dependency changes).
// ---------------------------------------------------------------------------
function MapEvents({ onBoundsChange }: { onBoundsChange?: (b: MapBounds) => void }) {
  const { useMapEvents } = require('react-leaflet');
  useMapEvents({
    moveend: (e: any) => {
      if (!onBoundsChange) return;
      const b = e.target.getBounds();
      onBoundsChange({
        sw_lat: b.getSouthWest().lat,
        sw_lng: b.getSouthWest().lng,
        ne_lat: b.getNorthEast().lat,
        ne_lng: b.getNorthEast().lng,
      });
    },
  });
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    // Only move if the view actually differs, so a redundant setView can't
    // fire a spurious moveend.
    const c = map.getCenter();
    if (Math.abs(c.lat - center[0]) > 1e-6 || Math.abs(c.lng - center[1]) > 1e-6
        || map.getZoom() !== zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

function MapFitBounds({ points, fitKey }: { points: [number, number][]; fitKey?: number }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    if (!fitKey || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points as any, { padding: [40, 40], maxZoom: 14 });
    }
    // Re-fit only when fitKey changes (on load / filter), never on user pans.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  return null;
}

function MapResize() {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 200);
    window.addEventListener('resize', fix);
    return () => { clearTimeout(t); window.removeEventListener('resize', fix); };
  }, [map]);
  return null;
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
  fitKey,
}: MapViewProps) {
  const L = require('leaflet');
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');

  // Fix Leaflet default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, [L]);

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

  // Draggable marker (create/detail only — not in the multi-venue loop path)
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
      <Marker draggable eventHandlers={eventHandlers} position={position} ref={markerRef} icon={activeIcon}>
        <Popup>Drag to adjust location</Popup>
      </Marker>
    );
  }

  const mappableVenues = venues.filter((v) => v.latitude != null && v.longitude != null);

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
        {/* CARTO Voyager basemap — production-friendly (OSM's own tile servers
            rate-limit/block app traffic). Free for reasonable use, no key. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <MapResize />
        {interactive && <MapEvents onBoundsChange={onBoundsChange} />}
        <MapUpdater center={center} zoom={zoom} />
        <MapFitBounds points={mappableVenues.map((v) => [v.latitude!, v.longitude!])} fitKey={fitKey} />

        {/* Single marker mode (venue detail / create) */}
        {singleMarker && !draggableMarker && (
          <Marker position={[singleMarker.lat, singleMarker.lng]} icon={activeIcon}>
            <Popup>Venue Location</Popup>
          </Marker>
        )}
        {singleMarker && draggableMarker && (
          <DraggableMarkerComponent position={[singleMarker.lat, singleMarker.lng]} onDrag={onMarkerDrag} />
        )}

        {/* Multi-venue markers */}
        {!singleMarker && mappableVenues.map((venue) => {
          const isActive = venue.id === selectedVenueId || venue.id === hoveredVenueId;
          return (
            <Marker
              key={venue.id}
              position={[venue.latitude!, venue.longitude!]}
              icon={isActive ? activeIcon : defaultIcon}
              eventHandlers={{ click: () => onVenueClick?.(venue.id) }}
            >
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <strong style={{ fontSize: 14 }}>{venue.title}</strong>
                  <br />
                  <span style={{ color: '#666', fontSize: 12 }}>{venue.city}, {venue.state}</span>
                  <br />
                  <span style={{ color: '#007db1', fontWeight: 'bold', fontSize: 14 }}>${venue.price_per_hour}/hr</span>
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
