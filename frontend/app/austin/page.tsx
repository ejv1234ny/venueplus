import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Venues in Austin, TX | VenuePlus',
  description: 'Rent unique event venues in Austin — rooftops, ranches, lofts, pool houses, and parking lots. Book venue + cleaning, security, catering, DJ, and bartending in one place.',
  openGraph: {
    title: 'Event Venues in Austin, TX | VenuePlus',
    description: 'Find rooftops, fields, lofts and more in Austin. Book the venue and all services in one transaction.',
    type: 'website',
  },
};

export default function AustinPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 to-accent-500 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Event Venues in Austin, TX</h1>
          <p className="text-xl mb-8">
            Rooftops, ranches, lofts, and parking lots — plus cleaning, security, catering, DJs, and bartenders. Booked together, in one transaction.
          </p>
          <Link href="/search?city=Austin" className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg inline-block">
            Browse Austin venues
          </Link>
        </div>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Why book through VenuePlus?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['One booking, everything covered', 'Venue + cleaning + security + catering — paid together, scheduled together.'],
            ['Verified local providers', '300+ Austin service providers ready to staff your event.'],
            ['Host-required services', 'Hosts can require certain services to protect their property; renters see this upfront.'],
          ].map(([t, d]) => (
            <div key={t} className="border rounded-lg p-6 bg-white">
              <h3 className="font-bold mb-2">{t}</h3>
              <p className="text-neutral-600 text-sm">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Popular Austin venue types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Rooftops','Ranches','Lofts','Pool houses','Parking lots','Warehouses','Gardens','Fields'].map(t => (
              <Link key={t} href={`/search?city=Austin&venue_type=${t.toLowerCase()}`}
                className="bg-white border rounded-lg p-4 text-center hover:shadow">
                <strong>{t}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Service providers in Austin</h2>
        <p className="mb-4 text-neutral-700">
          From security crews to bartenders to event DJs — every category in one search.
        </p>
        <Link href="/search?city=Austin" className="btn-primary">Start browsing</Link>
      </section>
    </div>
  );
}
