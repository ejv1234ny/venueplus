'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function VenueCard({ venue }: { venue: any }) {
  return (
    <Link href={`/venues/${venue.id}`} className="card group">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary-400 to-accent-400 relative overflow-hidden">
        {venue.images && venue.images.length > 0 ? (
          <Image
            src={venue.images[0]}
            alt={venue.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-50">V+</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 text-neutral-800 text-xs font-semibold px-2 py-1 rounded-full capitalize">
            {venue.venue_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
          {venue.title}
        </h3>
        <div className="flex items-center text-neutral-500 text-sm mt-1">
          <FiMapPin className="mr-1 flex-shrink-0" size={14} />
          <span>{venue.city}, {venue.state}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center text-neutral-600 text-sm">
            <FiUsers className="mr-1" size={14} />
            <span>Up to {venue.capacity}</span>
          </div>
          <div className="flex items-center font-semibold text-primary-600">
            <FiDollarSign size={16} />
            <span>{venue.price_per_hour}</span>
            <span className="text-neutral-400 text-sm font-normal">/hr</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
