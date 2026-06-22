'use client';
import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { searchAPI } from '@/lib/api';
import VenueCard from '@/components/VenueCard';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import { VenueCardSkeleton } from '@/components/Skeleton';

export default function SearchPage() {
  const [filters, setFilters] = useState({
    q: '', city: '', venue_type: '', max_price: '', min_capacity: '',
    sort: 'relevance',
  });
  const [results, setResults] = useState<any>({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const r = await searchAPI.venues(params);
      setResults(r.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Something went wrong while searching. Please try again.');
      setResults({ total: 0, items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Find a venue</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6 bg-white p-4 rounded-lg border">
        <div className="col-span-2">
          <label htmlFor="q" className="sr-only">Search venues</label>
          <input id="q" className="input-field w-full" placeholder="Search..."
            value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <div>
          <label htmlFor="city" className="sr-only">City</label>
          <input id="city" className="input-field w-full" placeholder="City"
            value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        </div>
        <div>
          <label htmlFor="venue_type" className="sr-only">Venue type</label>
          <input id="venue_type" className="input-field w-full" placeholder="Type"
            value={filters.venue_type} onChange={(e) => setFilters({ ...filters, venue_type: e.target.value })} />
        </div>
        <div>
          <label htmlFor="max_price" className="sr-only">Max price per hour</label>
          <input id="max_price" className="input-field w-full" placeholder="Max $/hr" type="number"
            value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} />
        </div>
        <div>
          <label htmlFor="min_capacity" className="sr-only">Minimum capacity</label>
          <input id="min_capacity" className="input-field w-full" placeholder="Min cap" type="number"
            value={filters.min_capacity} onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label htmlFor="sort" className="sr-only">Sort by</label>
          <select id="sort" className="input-field w-full" value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="capacity">Capacity</option>
          </select>
        </div>
        <Button onClick={run} loading={loading} fullWidth className="col-span-2">
          <FiSearch size={16} /> {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>

      {!loading && !error && (
        <p className="mb-4 text-neutral-600">
          {results.total} venue{results.total !== 1 ? 's' : ''} found
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <VenueCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="space-y-4">
          <Alert variant="error" title="Couldn’t load venues">{error}</Alert>
          <Button variant="outline" onClick={run}>Try again</Button>
        </div>
      ) : results.items.length === 0 ? (
        <EmptyState
          icon={<FiSearch size={48} />}
          title="No venues match your search"
          description="Try removing a filter, searching a different city, or raising the max price."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.items.map((v: any) => <VenueCard key={v.id} venue={v} />)}
        </div>
      )}
    </div>
  );
}
