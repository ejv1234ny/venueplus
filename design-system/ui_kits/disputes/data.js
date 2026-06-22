/* Disputes & Resolutions — cases + the policies that govern them.
   Covers host cancellation, service shortfall, provider no-show, renter no-show.
   Money-movement and legal actions stay hard-gated to the operator. */
(function () {
  const CASES = [
    {
      id: 1204, type: 'provider_noshow', label: 'Provider no-show', severity: 'high',
      title: 'Security provider did not show', cat: 'security',
      venue: 'The Cathedral Hall', renter: 'Jordan Lee', host: 'Marcus Reed', provider: 'Apex Guard LLC',
      event: 'Jun 28', escrow: 275.00, policyId: 'provider_noshow',
      reason: 'The booked security provider never arrived. Security is a required service, so the event ran out of compliance.',
      timeline: [
        ['6:00pm', 'Event start — no security on site'],
        ['6:20pm', 'Renter flagged the no-show in-app'],
        ['6:25pm', 'Provider Network searched for a replacement (none available in time)'],
      ],
      recommendation: {
        summary: 'Refund the full $275 service line to the renter, attempt a replacement, and suspend the provider pending Trust & Safety review.',
        actions: [
          ['Refund $275 service portion to renter', 'money_movement', 275.00],
          ['Dispatch replacement provider (future bookings)', 'financial', null],
          ['Suspend Apex Guard pending review', 'legal', null],
        ],
      },
      alternatives: ['Waive the renter\u2019s platform fee as additional goodwill', 'Permanent removal if this is a repeat no-show'],
    },
    {
      id: 1188, type: 'host_cancellation', label: 'Host cancellation', severity: 'high',
      title: 'Host cancelled 4 hours before the event',
      venue: 'Wildflower Field', renter: 'Sam Ortiz', host: 'Dana Cole',
      event: 'Jun 20', escrow: 640.00, policyId: 'host_cancellation',
      reason: 'Host cancelled citing a scheduling conflict, 4 hours before the 6pm start — inside the 24-hour penalty window.',
      timeline: [
        ['Jun 18', 'Booking confirmed & paid into escrow'],
        ['Jun 20 · 2:10pm', 'Host cancelled (within 24h)'],
        ['Jun 20 · 2:15pm', 'Renter notified automatically'],
      ],
      recommendation: {
        summary: 'Full refund to the renter with the platform fee waived, an automated rebooking offer, and a cancellation penalty applied to the host.',
        actions: [
          ['Refund renter in full ($640, fee waived)', 'money_movement', 640.00],
          ['Offer 3 comparable nearby venues', 'outbound', null],
          ['Apply host cancellation penalty', 'internal_write', null],
        ],
      },
      alternatives: ['Partial refund if the renter accepts a rescheduled date', 'Platform goodwill credit instead of a cash refund'],
    },
    {
      id: 1197, type: 'service_shortfall', label: 'Service shortfall', severity: 'medium',
      title: 'Food truck arrived 40 minutes late', cat: 'catering',
      venue: 'Skyline Rooftop Loft', renter: 'Priya N.', host: 'Marcus Reed', provider: 'Austin Eats Co.',
      event: 'Jun 24', escrow: 420.00, policyId: 'service_shortfall',
      reason: 'Renter reports the catering provider arrived 40 minutes late; guests waited. Photos and timestamps submitted.',
      timeline: [
        ['5:00pm', 'Event start'],
        ['5:40pm', 'Caterer arrived (per renter evidence)'],
        ['Jun 25', 'Renter opened a dispute with photos'],
      ],
      recommendation: {
        summary: 'Issue a 25% service credit ($105) to the renter, deducted from the provider\u2019s payout, and log the shortfall on the provider\u2019s record.',
        actions: [
          ['Issue $105 service credit to renter', 'money_movement', 105.00],
          ['Deduct credit from provider payout', 'internal_write', null],
          ['Log shortfall on provider rating', 'internal_write', null],
        ],
      },
      alternatives: ['Full service refund if a second complaint exists', 'Platform absorbs the credit to protect a top-rated provider'],
    },
    {
      id: 1186, type: 'renter_noshow', label: 'Renter no-show', severity: 'low',
      title: 'Renter never arrived and did not cancel',
      venue: 'Lakeside Pool House', renter: 'Casey R.', host: 'Ivy Lang',
      event: 'Jun 16', escrow: 742.00, policyId: 'renter_noshow',
      reason: 'The renter did not show for the booked window and never cancelled. Host held the space as reserved.',
      timeline: [
        ['Jun 16', 'Event window passed with no attendance'],
        ['Jun 17', 'Host confirmed the no-show'],
      ],
      recommendation: {
        summary: 'Host keeps the full payout per the cancellation policy, providers are paid for the reserved time, and no refund is issued to the renter.',
        actions: [
          ['Release host payout ($440)', 'money_movement', 440.00],
          ['Pay providers for reserved time', 'money_movement', null],
          ['Close case — no renter refund', 'internal_write', null],
        ],
      },
      alternatives: ['One-time 50% reschedule credit for a first offense'],
    },
  ];

  const POLICIES = [
    {
      id: 'host_cancellation', title: 'Host / listing cancellation', fault: 'Host at fault', tone: 'var(--status-error-fg)',
      rule: 'Cancellation within 24h of the event → 100% refund to the renter, platform fee waived.',
      procedure: ['Auto-refund the renter in full', 'Offer rebooking to comparable nearby venues', 'Apply a cancellation penalty to the host', 'Repeat offenders are delisted'],
    },
    {
      id: 'service_shortfall', title: 'Service below standard', fault: 'Provider partially at fault', tone: 'var(--status-pending-fg)',
      rule: 'Verified shortfall → prorated credit (25–100% of the service line) drawn from the provider payout.',
      procedure: ['Collect evidence from the reporting party', 'Apply a prorated service credit', 'Deduct from the provider payout, never the host', 'Log against provider rating; review on repeat'],
    },
    {
      id: 'provider_noshow', title: 'Provider no-show', fault: 'Provider at fault', tone: 'var(--status-error-fg)',
      rule: 'No-show on a booked service → 100% refund of that service line; replacement dispatched if feasible.',
      procedure: ['Refund the full service portion to the renter', 'Provider Network attempts a replacement', 'Suspend the provider pending Trust & Safety review', 'Required-service no-shows can trigger a venue rebooking'],
    },
    {
      id: 'renter_noshow', title: 'Renter no-show', fault: 'Renter at fault', tone: 'var(--neutral-500)',
      rule: 'No-show without cancellation → host keeps payout; providers paid for reserved time; no refund.',
      procedure: ['Confirm the no-show with the host', 'Release host & provider payouts as normal', 'No refund to the renter', 'Optional one-time reschedule credit for a first offense'],
    },
  ];

  window.DISPUTES = { CASES, POLICIES };
})();
