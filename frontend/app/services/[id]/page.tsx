'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiMapPin, FiDollarSign, FiClock, FiStar, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { servicesAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { serviceCategoryLabel } from '@/lib/serviceCategories';

const categoryColors: Record<string, string> = {
  cleaning: 'bg-green-100 text-green-700',
  security: 'bg-red-100 text-red-700',
  catering: 'bg-orange-100 text-orange-700',
  bartending: 'bg-purple-100 text-purple-700',
  dj: 'bg-pink-100 text-pink-700',
  photography: 'bg-blue-100 text-blue-700',
  decoration: 'bg-yellow-100 text-yellow-700',
  equipment: 'bg-gray-100 text-gray-700',
  staff: 'bg-indigo-100 text-indigo-700',
  other: 'bg-neutral-100 text-neutral-700',
};

const dayLabels: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = Number(params.id);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await servicesAPI.getById(serviceId);
        setService(response.data);
      } catch (err: any) {
        setError('Service provider not found.');
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [serviceId]);

  if (loading) return <LoadingSpinner message="Loading service details..." />;
  if (error || !service) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{error || 'Service not found.'}</p>
        <Link href="/services" className="btn-primary mt-4 inline-block">Back to Services</Link>
      </div>
    );
  }

  const colorClass = categoryColors[service.service_category] || categoryColors.other;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/services" className="inline-flex items-center text-neutral-500 hover:text-primary-600 mb-6">
          <FiArrowLeft className="mr-2" /> Back to Services
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-3 ${colorClass}`}>
                {serviceCategoryLabel(service.service_category)}
              </span>
              {service.is_claimed === false && (
                <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full mb-3 ml-2 bg-neutral-800 text-white uppercase tracking-wide">
                  Unclaimed
                </span>
              )}
              <h1 className="text-3xl font-bold text-neutral-900">{service.service_name}</h1>
              {service.rating > 0 && (
                <div className="flex items-center mt-2">
                  <FiStar className="text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-medium">{service.rating.toFixed(1)}</span>
                  <span className="text-neutral-400 ml-1">({service.total_reviews} review{service.total_reviews !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600 flex items-center">
                <FiDollarSign size={24} />
                {service.hourly_rate}
                <span className="text-sm font-normal text-neutral-500 ml-1">/hr</span>
              </div>
              <div className="flex items-center text-neutral-500 text-sm mt-1 justify-end">
                <FiClock className="mr-1" size={14} />
                Min {service.minimum_hours} hour{service.minimum_hours !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {service.is_claimed === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-amber-800">
              <strong>This is an unclaimed directory listing.</strong> Is this your business?
              Claim it to manage your profile, set pricing, and accept bookings. It can&apos;t be booked until claimed.
            </p>
            <Link href={`/claim?service_provider=${service.id}`} className="btn-primary text-sm whitespace-nowrap">
              Claim this business
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">About</h2>
              <p className="text-neutral-600 whitespace-pre-line">{service.description}</p>
            </div>

            {/* Portfolio Images */}
            {service.images && service.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-3">Portfolio</h2>
                <div className="grid grid-cols-2 gap-3">
                  {service.images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${service.service_name} portfolio ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Service Areas */}
            {service.service_area_cities && service.service_area_cities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">
                  <FiMapPin className="inline mr-2" />
                  Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.service_area_cities.map((city: string, i: number) => (
                    <span key={i} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {service.availability && Object.keys(service.availability).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">
                  <FiCalendar className="inline mr-2" />
                  Availability
                </h3>
                <div className="space-y-2">
                  {Object.entries(service.availability).map(([day, status]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{dayLabels[day] || day}</span>
                      <span className={`font-medium capitalize ${status === 'available' ? 'text-green-600' : 'text-neutral-400'}`}>
                        {String(status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-neutral-700 text-sm mb-3">
                Services are booked through venue bookings.
              </p>
              <Link href="/venues" className="btn-primary inline-block">
                Browse Venues
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
