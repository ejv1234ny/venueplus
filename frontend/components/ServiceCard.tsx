'use client';

import Link from 'next/link';
import { FiDollarSign, FiMapPin, FiStar } from 'react-icons/fi';
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

export default function ServiceCard({ service }: { service: any }) {
  const colorClass = categoryColors[service.service_category] || categoryColors.other;
  const hasImage = service.images && service.images.length > 0;
  const unclaimed = service.is_claimed === false;

  return (
    <Link href={`/services/${service.id}`} className="card group block">
      {/* Image / category header — real photo when present, tasteful category tile otherwise */}
      <div className="relative h-28 overflow-hidden">
        {hasImage ? (
          <img
            src={service.images[0]}
            alt={service.service_name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${colorClass}`}>
            <span className="text-xl font-bold opacity-70">
              {serviceCategoryLabel(service.service_category)}
            </span>
          </div>
        )}
        {unclaimed && (
          <span className="absolute top-2 left-2 bg-neutral-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Unclaimed
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
            {serviceCategoryLabel(service.service_category)}
          </span>
          {service.rating > 0 && (
            <div className="flex items-center text-sm text-neutral-600">
              <FiStar className="text-yellow-400 fill-yellow-400 mr-1" size={14} />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-neutral-400 ml-1">({service.total_reviews})</span>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
          {service.service_name}
        </h3>

        <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{service.description}</p>

        {service.service_area_cities && service.service_area_cities.length > 0 && (
          <div className="flex items-center text-neutral-500 text-sm mt-3">
            <FiMapPin className="mr-1 flex-shrink-0" size={14} />
            <span className="truncate">{service.service_area_cities.join(', ')}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <span className="text-sm text-neutral-500">Min {service.minimum_hours}hr</span>
          <div className="flex items-center font-semibold text-primary-600">
            <FiDollarSign size={16} />
            <span>{service.hourly_rate}</span>
            <span className="text-neutral-400 text-sm font-normal">/hr</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
