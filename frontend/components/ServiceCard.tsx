'use client';

import Link from 'next/link';
import { FiDollarSign, FiMapPin, FiStar } from 'react-icons/fi';

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

  return (
    <Link href={`/services/${service.id}`} className="card group p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${colorClass}`}>
          {service.service_category}
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

      <p className="text-neutral-500 text-sm mt-1 line-clamp-2">
        {service.description}
      </p>

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
    </Link>
  );
}
