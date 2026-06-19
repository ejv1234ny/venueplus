export const metadata = { title: 'Terms of Service | VenuePlus' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 prose">
      <h1>Terms of Service</h1>

      <div className="not-prose mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
        <p className="font-semibold">VenuePlus is free during beta.</p>
        <p className="text-sm mt-1">
          We charge no platform fee and process no payments. Bookings carry no
          charge and can be cancelled anytime at no cost. We&apos;ll give advance
          notice before any fees or payments are introduced.
        </p>
      </div>

      <p><em>Summary below. The full text lives in the project repository under{' '}
      <code>legal/terms-of-service.md</code> &mdash; have a marketplace lawyer review before
      enabling paid features.</em></p>

      <h2>1. The Service</h2>
      <p>
        VenuePlus is a marketplace connecting renters with event venues and
        on-site service providers (catering, photography, DJ, bartending,
        security, cleaning, decoration, equipment, staff, and more). VenuePlus
        is not a party to any rental or service contract between users.
      </p>

      <h2>2. Free Beta &amp; Payments</h2>
      <p>
        During the free beta, using VenuePlus is free: no platform fee and no
        payments are processed. A booking is confirmed when a host accepts the
        request; no money changes hands through the platform. When paid bookings
        are later enabled, displayed pricing will include the platform fee and
        payments will be handled by Stripe — you&apos;ll be able to review updated
        terms first.
      </p>

      <h2>3. Accounts &amp; Eligibility</h2>
      <p>
        You must be at least 18. You are responsible for your account and for the
        accuracy of any listing you create. Some listings may be created from
        public business data and shown as unclaimed until the business claims
        them; unclaimed listings are not bookable.
      </p>

      <h2>4. Listings, Hosts &amp; Providers</h2>
      <p>
        Hosts and providers are responsible for the accuracy of their listings
        and for any licenses, insurance, and taxes their work requires. Providers
        are independent contractors, not employees of VenuePlus. Hosts may set
        rules and mandatory services that renters accept at checkout.
      </p>

      <h2>5. Cancellations</h2>
      <p>
        During the free beta there are no monetary cancellation penalties —
        cancel before the event at no cost. Once paid bookings are enabled,
        cancellation eligibility follows the policy shown at checkout.
      </p>

      <h2>6. Conduct, Liability &amp; Disputes</h2>
      <p>
        Don&apos;t use the Service for anything illegal, misrepresent listings,
        circumvent the platform, or hold events that break local laws. Renters
        are encouraged to carry event insurance; hosts and providers should carry
        commercial liability insurance. VenuePlus is not liable for property
        damage, injury, or losses arising from any event, and may help mediate
        disputes at its discretion.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms; material changes will be announced by email or
        in-app notice.
      </p>

      <p className="text-sm text-gray-500">Questions? support@venueplus.com</p>
    </div>
  );
}
