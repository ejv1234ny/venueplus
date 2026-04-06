'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMapPin, FiX } from 'react-icons/fi';

export interface LocationResult {
  lat: number;
  lon: number;
  displayName: string;
  boundingbox?: [number, number, number, number]; // [south, north, west, east]
}

interface LocationSearchProps {
  onLocationSelect: (result: LocationResult) => void;
  placeholder?: string;
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = 'Search location...',
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: any) => {
    const bbox = result.boundingbox
      ? [
          parseFloat(result.boundingbox[0]),
          parseFloat(result.boundingbox[1]),
          parseFloat(result.boundingbox[2]),
          parseFloat(result.boundingbox[3]),
        ] as [number, number, number, number]
      : undefined;

    setQuery(result.display_name.split(',').slice(0, 2).join(','));
    setIsOpen(false);
    onLocationSelect({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      boundingbox: bbox,
    });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="input-field pl-9 pr-8"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[1000] mt-1 w-full bg-white rounded-lg shadow-lg border border-neutral-200 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-neutral-500 text-center">Searching...</div>
          ) : (
            results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-2.5 hover:bg-neutral-50 flex items-start gap-2 border-b border-neutral-50 last:border-0"
              >
                <FiMapPin className="text-primary-500 mt-0.5 flex-shrink-0" size={14} />
                <span className="text-sm text-neutral-700 line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
