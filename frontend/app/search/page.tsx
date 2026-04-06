'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchAPI } from '@/lib/api';

export default function SearchPage() {
  const [filters, setFilters] = useState({
    q: '', city: '', venue_type: '', max_price: '', min_capacity: '',
    sort: 'relevance',
  });
  const [results, setResults] = useState<any>({ total: 0, items: [] });
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const params: any = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const r = await searchAPI.venues(params);
    setResults(r.data);
    setLoading(false);
  };

  useEffect(() => { run(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Find a venue</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6 bg-white p-4 rounded-lg border">
        <input className="input-field col-span-2" placeholder="Search..."
          value={filters.q} onChange={(e) => setFilters({...filters, q: e.target.value})} />
        <input className="input-field" placeholder="City"
          value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})} />
        <input className="input-field" placeholder="Type"
          value={filters.venue_type} onChange={(e) => setFilters({...filters, venue_type: e.target.value})} />
        <input className="input-field" placeholder="Max $/hr" type="number"
          value={filters.max_price} onChange={(e) => setFilters({...filters, max_price: e.target.value})} />
        <input className="input-field" placeholder="Min cap" type="number"
          value={filters.min_capacity} onChange={(e) => setFilters({...filters, min_capacity: e.target.value})} />
        <select className="input-field col-span-2" value={filters.sort}
          onChange={(e) => setFilters({...filters, sort: e.target.value})}>
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="capacity">Capacity</option>
        </select>
        <button className="btn-primary col-span-2" onClick={run} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <p className="mb-4 text-neutral-600">{results.total} venues found</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.items.map((v: any) => (
          <Link href={`/venues/${v.id}`} key={v.id} className="card p-4 block">
            <h3 className="font-bold">{v.title}</h3>
            <p className="text-sm text-neutral-600">{v.venue_type} · {v.city}, {v.state}</p>
            <p className="text-sm">Capacity {v.capacity} · ${v.price_per_hour}/hr</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
