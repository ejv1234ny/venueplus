import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List your venue | VenuePlus',
  description: 'Earn money from your unused space. List your rooftop, field, loft, or parking lot on VenuePlus and host events with everything included.',
};

export default function ListYourVenuePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 to-accent-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Earn from your unused space</h1>
          <p className="text-xl mb-8">List your rooftop, field, loft, or parking lot in 10 minutes. We bring the renters, the services, and the payments.</p>
          <Link href="/register?role=venue_owner" className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg inline-block">
            Get started — it's free
          </Link>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">How it works</h2>
        <ol className="space-y-6">
          <li><strong>1. Create your listing</strong> — photos, capacity, price, rules. Takes 10 minutes.</li>
          <li><strong>2. Set your requirements</strong> — require cleaning crews, security, or any service. Renters agree at checkout.</li>
          <li><strong>3. Accept bookings</strong> — review requests and confirm. We handle payments.</li>
          <li><strong>4. Get paid</strong> — payouts hit your bank within 24 hours after each event.</li>
        </ol>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Pricing</h2>
          <p className="text-lg">VenuePlus charges a flat <strong>12% platform fee</strong> on the venue subtotal. No listing fees. No monthly fees.</p>
        </div>
      </section>
    </div>
  );
}
