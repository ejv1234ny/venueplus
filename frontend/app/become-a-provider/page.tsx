import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a service provider | VenuePlus',
  description: 'Earn money during your downtime. Cleaners, security, caterers, DJs, bartenders, photographers and more — accept event jobs that fit your schedule.',
};

export default function BecomeProviderPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 to-accent-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Get booked for events</h1>
          <p className="text-xl mb-8">VenuePlus matches you with event jobs that fit your category, area, and availability. Accept what you want, decline the rest.</p>
          <Link href="/register?role=service_provider" className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg inline-block">
            Join as a provider
          </Link>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Categories we match for</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Cleaning','Security','Catering','Bartending','DJ','Photography','Decoration','Equipment','Staff'].map(c => (
            <div key={c} className="border rounded-lg p-4 bg-white text-center font-semibold">{c}</div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">How it works</h2>
          <ol className="space-y-4">
            <li><strong>1. Sign up</strong> — 5-step onboarding wizard, takes 10 minutes.</li>
            <li><strong>2. Set your area + availability</strong> — cities you serve, weekly hours, blackout dates.</li>
            <li><strong>3. Get offers</strong> — when a venue requires your category and you're available, we send you the job.</li>
            <li><strong>4. Accept or decline</strong> — accepted jobs lock your slot. We handle payments.</li>
            <li><strong>5. Get paid</strong> — payouts hit your bank within 24 hours after each event.</li>
          </ol>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Pricing</h2>
        <p className="text-lg">VenuePlus charges a flat <strong>12% platform fee</strong> on your subtotal. No signup fee. No monthly fee.</p>
      </section>
    </div>
  );
}
