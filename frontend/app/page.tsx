'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiMapPin, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/venues?search=${encodeURIComponent(searchQuery)}`);
  };

  const venueTypes = [
    { name: 'Rooftops', icon: '🏙️', count: '150+' },
    { name: 'Fields', icon: '🌾', count: '200+' },
    { name: 'Pool Houses', icon: '🏊', count: '80+' },
    { name: 'Parking Lots', icon: '🅿️', count: '120+' },
    { name: 'Warehouses', icon: '🏭', count: '90+' },
    { name: 'Gardens', icon: '🌳', count: '110+' },
  ];

  const serviceCategories = [
    { name: 'Cleaning', icon: '🧹', description: 'Professional cleaning crews' },
    { name: 'Catering', icon: '🍽️', description: 'Delicious food options' },
    { name: 'Security', icon: '🛡️', description: 'Event security teams' },
    { name: 'DJ Services', icon: '🎧', description: 'Professional entertainers' },
    { name: 'Bartending', icon: '🍹', description: 'Expert bartenders' },
    { name: 'Photography', icon: '📸', description: 'Capture memories' },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Find Your Space',
      description: 'Browse unique venues from rooftops to fields',
    },
    {
      step: '2',
      title: 'Add Services',
      description: 'Book cleaning, catering, security, and more',
    },
    {
      step: '3',
      title: 'Host Your Event',
      description: 'Everything you need in one seamless booking',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mx-auto mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-2xl">
              <Image
                src="/venueplus-icon.png"
                alt="VenuePlus"
                width={72}
                height={72}
                priority
                className="w-16 h-16"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect Event Space
              <span className="block text-accent-200">+ Essential Services</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-50">
              From romantic rooftop picnics to classic car shows. Book unique venues and all the services you need—in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-full shadow-2xl p-2 flex items-center max-w-2xl mx-auto">
              <FiSearch className="text-neutral-400 ml-4" size={24} />
              <input
                type="text"
                placeholder="Search venues by location or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none"
              />
              <button type="submit" className="btn-accent rounded-full">
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 text-primary-100">
                <FiCheckCircle />
                <span>Trusted Venues</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-100">
                <FiCheckCircle />
                <span>Verified Services</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-100">
                <FiCheckCircle />
                <span>Seamless Booking</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0,0 C300,80 600,80 900,0 L900,100 L0,100 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">Explore Unique Spaces</h2>
          <p className="section-subtitle text-center">Find the perfect venue for any occasion</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {venueTypes.map((type) => (
              <Link
                key={type.name}
                href={`/venues?type=${type.name.toLowerCase()}`}
                className="card p-6 text-center hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="text-5xl mb-3">{type.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{type.name}</h3>
                <p className="text-sm text-neutral-500">{type.count} venues</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">How VenuePlus Works</h2>
          <p className="section-subtitle text-center">Three simple steps to your perfect event</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-neutral-600 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">Essential Services</h2>
          <p className="section-subtitle text-center">Book everything you need in one place</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((service) => (
              <Link
                key={service.name}
                href={`/services?category=${service.name.toLowerCase()}`}
                className="card p-6 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">{service.icon}</div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{service.name}</h3>
                    <p className="text-neutral-600">{service.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Host Your Event?
          </h2>
          <p className="text-xl mb-8 text-primary-50">
            Join thousands of happy event hosts who trust VenuePlus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/venues" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors">
              Browse Venues
            </Link>
            <Link href="/register" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* For Hosts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                List Your Space & Earn
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Turn your unused space into income. Whether it's a rooftop, field, or parking lot—list it on VenuePlus and connect with event hosts.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <FiCheckCircle className="text-accent-500 mt-1 flex-shrink-0" size={24} />
                  <span className="text-neutral-700">Set your own rules and pricing</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FiCheckCircle className="text-accent-500 mt-1 flex-shrink-0" size={24} />
                  <span className="text-neutral-700">Require mandatory services for protection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FiCheckCircle className="text-accent-500 mt-1 flex-shrink-0" size={24} />
                  <span className="text-neutral-700">Get paid quickly and securely</span>
                </li>
              </ul>
              <Link href="/register?role=venue_owner" className="btn-primary text-lg">
                Become a Host
              </Link>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Offer Services & Get Booked
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Are you a cleaner, caterer, DJ, or security professional? Join VenuePlus and earn money during your downtime by accepting event gigs.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <FiCheckCircle className="text-accent-500 mt-1 flex-shrink-0" size={24} />
                  <span className="text-neutral-700">Set your availability and rates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FiCheckCircle className="text-accent-500 mt-1 flex-shrink-0" size={24} />
                  <span className="text-neutral-700">Accept jobs that fit your schedule</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FiCheckCircle className="text-accent-500 mt-1 flex-shrink-0" size={24} />
                  <span className="text-neutral-700">Build your reputation and grow</span>
                </li>
              </ul>
              <Link href="/register?role=service_provider" className="btn-accent text-lg">
                Offer Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
