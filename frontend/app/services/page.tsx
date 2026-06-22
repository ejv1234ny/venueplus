'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { servicesAPI } from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import { ServiceGridSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

const categories = [
  { value: '', label: 'All' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'security', label: 'Security' },
  { value: 'catering', label: 'Catering' },
  { value: 'bartending', label: 'Bartending' },
  { value: 'dj', label: 'DJ' },
  { value: 'photography', label: 'Photography' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'staff', label: 'Staff' },
  { value: 'other', label: 'Other' },
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;

  const fetchServices = async (resetResults = true) => {
    if (resetResults) {
      setLoading(true);
      setSkip(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const params: any = { skip: resetResults ? 0 : skip, limit: LIMIT };
      if (selectedCategory) params.category = selectedCategory;
      if (city) params.city = city;
      if (maxRate) params.max_rate = parseFloat(maxRate);

      const response = await servicesAPI.search(params);
      const data = response.data;

      if (resetResults) {
        setServices(data);
      } else {
        setServices((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === LIMIT);
      if (!resetResults) setSkip((prev) => prev + LIMIT);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch on mount and whenever the selected category changes. A single effect
  // keyed on selectedCategory avoids the stale-closure double-fetch where an
  // unfiltered request could overwrite the filtered category results.
  useEffect(() => {
    fetchServices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => setSelectedCategory(category);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Find Service Providers</h1>
          <p className="section-subtitle">Book professional services for your event</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Additional Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field sm:max-w-xs"
          />
          <input
            type="number"
            placeholder="Max Rate/hr"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            className="input-field sm:max-w-xs"
          />
          <button onClick={() => fetchServices(true)} className="btn-primary flex items-center justify-center">
            <FiSearch className="mr-2" /> Search
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <ServiceGridSkeleton />
        ) : services.length === 0 ? (
          <EmptyState
            icon={<FiSearch size={48} />}
            title="No service providers found"
            description="Try adjusting your filters or browse all categories."
          />
        ) : (
          <>
            <p className="text-neutral-500 mb-6">Showing {services.length} provider{services.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setSkip((prev) => prev + LIMIT);
                    fetchServices(false);
                  }}
                  disabled={loadingMore}
                  className="btn-outline"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
