/* Mission Control — simulated fleet data.
   The full 14-agent fleet (see guidelines/agent-manual) feeding a single
   human-in-the-loop approval queue. Plain JS; attaches to window. */
(function () {
  // facet groups (order + label) used to organize the Agents tab
  const FACETS = [
    { id: 'supply-growth',  name: 'Supply Growth' },
    { id: 'demand-growth',  name: 'Demand Growth' },
    { id: 'onboarding-net', name: 'Onboarding & Network' },
    { id: 'operations',     name: 'Marketplace Operations' },
    { id: 'customer-plat',  name: 'Customer & Platform' },
  ];

  const AGENTS = [
    // Supply Growth
    { agent: 'discovery',  facet: 'supply-growth', role: 'Scrapes Google Places + Yelp for new venue & provider leads', last_run: '3 min ago',  done: 142, needs_approval: 0, blocked: 0 },
    { agent: 'enrichment', facet: 'supply-growth', role: 'Finds emails & socials via Hunter.io, dedupes contacts',       last_run: '3 min ago',  done: 118, needs_approval: 0, blocked: 1 },
    { agent: 'scoring',    facet: 'supply-growth', role: 'Ranks leads 0–100, auto-queues anything ≥ 60',                 last_run: '3 min ago',  done: 118, needs_approval: 0, blocked: 0 },
    { agent: 'outreach',   facet: 'supply-growth', role: 'Drafts personalized cold emails with Claude',                  last_run: '8 min ago',  done: 64,  needs_approval: 2, blocked: 0 },
    // Demand Growth
    { agent: 'seo',        facet: 'demand-growth', role: 'Generates venue listing pages & blog posts',                   last_run: '22 min ago', done: 37,  needs_approval: 1, blocked: 0 },
    { agent: 'social',     facet: 'demand-growth', role: 'Drafts Facebook & Instagram posts',                            last_run: '1 hr ago',   done: 29,  needs_approval: 0, blocked: 0 },
    { agent: 'campaign',   facet: 'demand-growth', role: 'Runs venue / provider / renter drip sequences',                last_run: '12 min ago', done: 51,  needs_approval: 0, blocked: 0 },
    // Onboarding & Network
    { agent: 'onboarding', facet: 'onboarding-net', role: 'Gets signed venues & providers fully live, priced & bookable', last_run: '9 min ago', done: 46, needs_approval: 1, blocked: 0 },
    { agent: 'network',    facet: 'onboarding-net', role: 'Matches required services to bookings; watches coverage',      last_run: '4 min ago',  done: 83,  needs_approval: 1, blocked: 1 },
    // Marketplace Operations
    { agent: 'bookings',   facet: 'operations', role: 'Runs the booking lifecycle, changes, refunds & disputes',         last_run: '2 min ago',  done: 159, needs_approval: 1, blocked: 0 },
    { agent: 'trust',      facet: 'operations', role: 'Verifies identity, insurance & compliance; screens fraud',        last_run: '7 min ago',  done: 94,  needs_approval: 1, blocked: 0 },
    { agent: 'finance',    facet: 'operations', role: 'Collects, holds, pays out, reconciles & reports',                 last_run: '5 min ago',  done: 71,  needs_approval: 1, blocked: 0 },
    // Customer & Platform
    { agent: 'support',    facet: 'customer-plat', role: 'Triages & drafts replies for renters, hosts & providers',      last_run: '1 min ago',  done: 203, needs_approval: 1, blocked: 0 },
    { agent: 'monitor',    facet: 'customer-plat', role: 'Hourly anomaly detection across the whole funnel',             last_run: '6 min ago',  done: 210, needs_approval: 0, blocked: 0 },
  ];

  const METRICS = {
    active_venues: 312, active_providers: 196, bookings_30d: 88,
    gmv: 48240, fees: 6753, total_bookings: 1204,
    categories: 9, cities: 10,
    fully_serviced_pct: 91, unserviceable: 2, bookings_per_venue: 3.9,
  };

  const ESCALATIONS = [
    { id: 50, kind: 'listing_review', tool: 'activate_listing', risk: 'outbound', agent: 'onboarding', run_id: 310,
      run_goal: 'Onboard The Cathedral Hall (Austin)',
      reason: 'New listing is complete and ready to go live. Review before it\u2019s bookable.',
      created_at: '9 min ago',
      payload: {
        name: 'The Cathedral Hall', type: 'hall', city: 'Austin', state: 'TX', host: 'Marcus Reed',
        capacity: 150, price: 160, suggested_price: 160, photos: 6, completeness: 100,
        amenities: ['Parking', 'Restrooms', 'A/V system', 'Stage', 'Heating / AC'],
        required: ['security', 'cleaning', 'insurance'],
        checks: [['Photos verified', true], ['Capacity confirmed', true], ['Pricing within comps', true], ['Required services attached', true]],
      } },
    { id: 51, kind: 'provider_review', tool: 'verify_provider', risk: 'legal', agent: 'trust', run_id: 316,
      run_goal: 'Verify new provider — Lone Star Event Security',
      reason: 'New provider passed automated checks. Approve to add them to the network.',
      created_at: '14 min ago',
      payload: {
        name: 'Lone Star Event Security', category: 'security', area: 'Austin, TX', radius: 25,
        team: 6, rate: 55, license: 'TX-4480231', insurance_status: 'valid', insurance_expires: 'Mar 2027',
        checks: [['Identity verified', true], ['Business license valid', true], ['Insurance certificate valid', true], ['No fraud signals', true]],
      } },
    { id: 41, tool: 'send_outreach_email', risk: 'outbound', agent: 'outreach', run_id: 308,
      run_goal: 'Grow venue supply in Austin, TX',
      reason: 'Cold email to 1 new rooftop lead (The Cathedral, Austin). Draft scored 87/100.',
      created_at: '8 min ago',
      args: { to: 'events@thecathedral-atx.com', subject: 'Earn from your rooftop on event nights', template: 'venue_cold_v3' } },
    { id: 43, tool: 'publish_seo_page', risk: 'outbound', agent: 'seo', run_id: 309,
      run_goal: 'Publish 5 venue landing pages for Nashville',
      reason: 'Publish listing page "Rooftop Venues in Nashville" (1,180 words, meta complete).',
      created_at: '22 min ago',
      args: { slug: 'rooftop-venues-nashville', target_keywords: ['nashville rooftop venue', 'event space nashville'] } },
    { id: 45, tool: 'dispatch_service_request', risk: 'financial', agent: 'network', run_id: 312,
      run_goal: 'Service booking #1204 (warehouse, 120 guests)',
      reason: 'Dispatch paid request to Lone Star Event Security — $55/hr × 5h. Only provider in range.',
      created_at: '4 min ago',
      args: { booking_id: 1204, provider: 'Lone Star Event Security', category: 'security', est_cost_usd: 275.0 } },
    { id: 46, tool: 'issue_refund', risk: 'money_movement', agent: 'bookings', run_id: 311,
      run_goal: 'Resolve flagged booking #1188',
      reason: 'Host cancelled 4h before event. Policy: full refund of $640 to renter.',
      created_at: '6 min ago',
      args: { booking_id: 1188, amount_usd: 640.0, reason: 'host_cancellation_within_24h' } },
    { id: 47, tool: 'release_payout_batch', risk: 'money_movement', agent: 'finance', run_id: 313,
      run_goal: 'Weekly host & provider payouts',
      reason: 'Release 24 payouts totaling $9,420 for completed bookings. Reconciliation clean.',
      created_at: '11 min ago',
      args: { payouts: 24, total_usd: 9420.0, period: '2026-06-15 → 2026-06-21' } },
    { id: 48, tool: 'suspend_listing', risk: 'legal', agent: 'trust', run_id: 314,
      run_goal: 'Insurance compliance sweep',
      reason: 'Venue "East Side Works" insurance certificate expired 3 days ago. Recommend suspend until renewed.',
      created_at: '7 min ago',
      args: { venue_id: 88, reason: 'expired_insurance', expired_on: '2026-06-19' } },
    { id: 49, tool: 'send_support_reply', risk: 'outbound', agent: 'support', run_id: 315,
      run_goal: 'Ticket #5521 — renter dispute, frustrated',
      reason: 'Renter unhappy a food truck arrived 40 min late. Drafted apology + $50 goodwill credit offer.',
      created_at: '3 min ago',
      args: { ticket_id: 5521, sentiment: 'negative', proposes_credit_usd: 50.0 } },
  ];

  const RUNS = [
    { id: 316, goal: 'Verify new provider — Lone Star Event Security', status: 'needs_approval', executed: 4, total: 5, pending: 1, when: '14 min ago',
      jobs: [
        { agent: 'trust', status: 'needs_approval', blockers: [], actions: [
          { tool: 'verify_identity', risk: 'read', decision: 'auto', executed: true, reason: 'Owner identity confirmed via KYC.' },
          { tool: 'validate_license', risk: 'read', decision: 'auto', executed: true, reason: 'License TX-4480231 active & valid.' },
          { tool: 'validate_insurance', risk: 'read', decision: 'auto', executed: true, reason: 'Insurance certificate valid through Mar 2027.' },
          { tool: 'fraud_scan', risk: 'read', decision: 'auto', executed: true, reason: 'No fraud signals.' },
          { tool: 'verify_provider', risk: 'legal', decision: 'require_approval', executed: false, reason: 'Adding provider to network — operator approval.' },
        ] },
      ] },
    { id: 315, goal: 'Ticket #5521 — renter dispute, frustrated', status: 'needs_approval', executed: 2, total: 3, pending: 1, when: '3 min ago',
      jobs: [
        { agent: 'support', status: 'needs_approval', blockers: [], actions: [
          { tool: 'load_ticket_context', risk: 'read', decision: 'auto', executed: true, reason: 'Pulled booking #1197 + provider arrival log.' },
          { tool: 'classify_sentiment', risk: 'read', decision: 'auto', executed: true, reason: 'Negative; flagged at-risk renter.' },
          { tool: 'send_support_reply', risk: 'outbound', decision: 'require_approval', executed: false, reason: 'Customer-facing apology + $50 credit — needs operator.' },
        ] },
      ] },
    { id: 314, goal: 'Insurance compliance sweep', status: 'needs_approval', executed: 3, total: 4, pending: 1, when: '7 min ago',
      jobs: [
        { agent: 'trust', status: 'needs_approval', blockers: [], actions: [
          { tool: 'scan_insurance_certs', risk: 'read', decision: 'auto', executed: true, reason: 'Checked 312 venues; 1 expired, 2 expiring soon.' },
          { tool: 'notify_host_renewal', risk: 'outbound', decision: 'auto', executed: true, reason: 'Sent renewal reminders to 3 hosts.' },
          { tool: 'flag_listing', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Flagged East Side Works internally.' },
          { tool: 'suspend_listing', risk: 'legal', decision: 'require_approval', executed: false, reason: 'Hard-gated legal action — awaiting operator.' },
        ] },
      ] },
    { id: 313, goal: 'Weekly host & provider payouts', status: 'needs_approval', executed: 3, total: 4, pending: 1, when: '11 min ago',
      jobs: [
        { agent: 'finance', status: 'needs_approval', blockers: [], actions: [
          { tool: 'gather_completed_bookings', risk: 'read', decision: 'auto', executed: true, reason: 'Found 24 completed bookings since last run.' },
          { tool: 'compute_fee_splits', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Computed platform fees + net payouts.' },
          { tool: 'reconcile', risk: 'read', decision: 'auto', executed: true, reason: 'Reconciled against Stripe — zero variance.' },
          { tool: 'release_payout_batch', risk: 'money_movement', decision: 'require_approval', executed: false, reason: 'Hard-gated: $9,420 across 24 payouts.' },
        ] },
      ] },
    { id: 312, goal: 'Service booking #1204 (warehouse, 120 guests)', status: 'needs_approval', executed: 2, total: 3, pending: 1, when: '4 min ago',
      jobs: [
        { agent: 'network', status: 'needs_approval', blockers: [], actions: [
          { tool: 'match_providers', risk: 'read', decision: 'auto', executed: true, reason: 'Required: security. 1 provider in range (Lone Star).' },
          { tool: 'rank_providers', risk: 'read', decision: 'auto', executed: true, reason: 'Single-provider dependency — flagged to Discovery.' },
          { tool: 'dispatch_service_request', risk: 'financial', decision: 'require_approval', executed: false, reason: 'Paid dispatch ($275) — needs operator.' },
        ] },
      ] },
    { id: 311, goal: 'Resolve flagged booking #1188', status: 'needs_approval', executed: 3, total: 4, pending: 1, when: '6 min ago',
      jobs: [
        { agent: 'bookings', status: 'needs_approval', blockers: [], actions: [
          { tool: 'read_booking', risk: 'read', decision: 'auto', executed: true, reason: 'Loaded booking #1188 + cancellation timestamp.' },
          { tool: 'classify_cancellation', risk: 'read', decision: 'auto', executed: true, reason: 'Host cancelled 4h prior → within-24h policy.' },
          { tool: 'notify_renter', risk: 'outbound', decision: 'auto', executed: true, reason: 'Sent "your event was cancelled" email.' },
          { tool: 'issue_refund', risk: 'money_movement', decision: 'require_approval', executed: false, reason: 'Hard-gated: moving $640. Awaiting operator.' },
        ] },
      ] },
    { id: 310, goal: 'Onboard The Cathedral Hall (Austin)', status: 'needs_approval', executed: 4, total: 5, pending: 1, when: '9 min ago',
      jobs: [
        { agent: 'onboarding', status: 'needs_approval', blockers: [], actions: [
          { tool: 'draft_profile', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Drafted listing copy from host intake.' },
          { tool: 'suggest_pricing', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Suggested $160/hr from 6 local comps.' },
          { tool: 'validate_completeness', risk: 'read', decision: 'auto', executed: true, reason: 'Photos, capacity, availability complete.' },
          { tool: 'attach_required_services', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Added mandatory security + cleaning rules.' },
          { tool: 'activate_listing', risk: 'outbound', decision: 'require_approval', executed: false, reason: 'Going live — operator review.' },
        ] },
      ] },
    { id: 309, goal: 'Publish 5 venue landing pages for Nashville', status: 'needs_approval', executed: 9, total: 10, pending: 1, when: '22 min ago',
      jobs: [
        { agent: 'seo', status: 'needs_approval', blockers: [], actions: [
          { tool: 'draft_seo_page', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Drafted 5 listing pages from venue data.' },
          { tool: 'generate_meta', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Titles + descriptions within length limits.' },
          { tool: 'publish_seo_page', risk: 'outbound', decision: 'require_approval', executed: false, reason: 'Publishing live page — operator review on first of batch.' },
        ] },
      ] },
    { id: 308, goal: 'Grow venue supply in Austin, TX', status: 'needs_approval', executed: 14, total: 16, pending: 2, when: '8 min ago',
      jobs: [
        { agent: 'discovery', status: 'done', blockers: [], actions: [
          { tool: 'search_places', risk: 'read', decision: 'auto', executed: true, reason: 'Found 38 rooftop / warehouse candidates in Austin.' },
        ] },
        { agent: 'enrichment', status: 'done', blockers: [], actions: [
          { tool: 'find_contact', risk: 'read', decision: 'auto', executed: true, reason: 'Resolved emails for 31 of 38 leads.' },
        ] },
        { agent: 'scoring', status: 'done', blockers: [], actions: [
          { tool: 'score_leads', risk: 'read', decision: 'auto', executed: true, reason: 'Auto-queued 12 leads scoring ≥ 60.' },
        ] },
        { agent: 'outreach', status: 'needs_approval', blockers: [], actions: [
          { tool: 'draft_email', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Drafted 12 personalized cold emails.' },
          { tool: 'send_outreach_email', risk: 'outbound', decision: 'require_approval', executed: false, reason: '2 top-scoring drafts held for operator review.' },
        ] },
      ] },
    { id: 305, goal: 'Re-engage lapsed providers (no jobs in 30d)', status: 'done', executed: 7, total: 7, pending: 0, when: '2 hr ago',
      jobs: [
        { agent: 'campaign', status: 'done', blockers: [], actions: [
          { tool: 'enroll_drip', risk: 'internal_write', decision: 'auto', executed: true, reason: 'Enrolled 23 providers in win-back drip.' },
          { tool: 'send_campaign_email', risk: 'outbound', decision: 'auto', executed: true, reason: 'Below auto-send threshold; sent step 1.' },
        ] },
      ] },
    { id: 301, goal: 'Daily funnel health check', status: 'done', executed: 5, total: 5, pending: 0, when: '5 hr ago',
      jobs: [
        { agent: 'monitor', status: 'done', blockers: [], actions: [
          { tool: 'scan_funnel', risk: 'read', decision: 'auto', executed: true, reason: 'No anomalies above threshold.' },
        ] },
      ] },
  ];

  window.MC_DATA = { FACETS, AGENTS, METRICS, ESCALATIONS, RUNS, POLICIES };

  /* Per-agent action policies for the Settings screen.
     policy: 'auto' | 'approval' | 'off'. Gates marked locked are money- or
     legal-risk and cannot be set to auto — the platform's hard gates. */
  var POLICIES = {
    discovery: { gates: [
        { id: 'write_leads', label: 'Write new leads to the database', risk: 'internal_write', policy: 'auto' },
      ], thresholds: [
        { id: 'cities', label: 'Active discovery cities', value: 10, min: 1, max: 25, step: 1 },
      ] },
    enrichment: { gates: [
        { id: 'enrich', label: 'Enrich & verify contacts', risk: 'internal_write', policy: 'auto' },
      ], thresholds: [
        { id: 'budget', label: 'Monthly enrichment budget', value: 500, min: 0, max: 2000, step: 50, unit: '$' },
      ] },
    scoring: { gates: [
        { id: 'auto_queue', label: 'Auto-queue hot leads to Outreach', risk: 'internal_write', policy: 'auto' },
      ], thresholds: [
        { id: 'threshold', label: 'Auto-queue leads scoring at or above', value: 60, min: 0, max: 100, step: 5 },
      ] },
    outreach: { gates: [
        { id: 'send_email', label: 'Send first-touch cold emails', risk: 'outbound', policy: 'approval' },
        { id: 'send_followup', label: 'Send follow-ups in an active sequence', risk: 'outbound', policy: 'approval' },
      ], thresholds: [
        { id: 'daily_cap', label: 'Max outbound emails per day', value: 50, min: 0, max: 300, step: 10 },
      ] },
    seo: { gates: [
        { id: 'publish', label: 'Publish live listing pages & posts', risk: 'outbound', policy: 'approval' },
        { id: 'edit_meta', label: 'Edit metadata on already-live pages', risk: 'internal_write', policy: 'auto' },
      ], thresholds: [] },
    social: { gates: [
        { id: 'post', label: 'Publish social posts', risk: 'outbound', policy: 'approval' },
        { id: 'reply', label: 'Reply to comments & DMs', risk: 'outbound', policy: 'approval' },
      ], thresholds: [] },
    campaign: { gates: [
        { id: 'enroll', label: 'Enroll users into journeys', risk: 'internal_write', policy: 'auto' },
        { id: 'send', label: 'Send lifecycle campaign messages', risk: 'outbound', policy: 'approval' },
      ], thresholds: [
        { id: 'freq_cap', label: 'Max messages per user per week', value: 3, min: 1, max: 10, step: 1 },
      ] },
    onboarding: { gates: [
        { id: 'set_price', label: 'Apply suggested pricing', risk: 'internal_write', policy: 'auto' },
        { id: 'activate', label: 'Activate a listing (go live)', risk: 'outbound', policy: 'approval' },
        { id: 'host_msg', label: 'Send host-facing messages', risk: 'outbound', policy: 'approval' },
      ], thresholds: [] },
    network: { gates: [
        { id: 'match', label: 'Auto-match providers to bookings', risk: 'read', policy: 'auto' },
        { id: 'dispatch', label: 'Dispatch paid service requests', risk: 'financial', policy: 'approval' },
      ], thresholds: [] },
    bookings: { gates: [
        { id: 'confirm', label: 'Confirm bookings & hold inventory', risk: 'internal_write', policy: 'auto' },
        { id: 'dispute_msg', label: 'Send dispute-resolution messages', risk: 'outbound', policy: 'approval' },
        { id: 'refund', label: 'Issue refunds & goodwill credits', risk: 'money_movement', policy: 'approval', locked: true },
      ], thresholds: [] },
    trust: { gates: [
        { id: 'checks', label: 'Run identity & insurance checks', risk: 'read', policy: 'auto' },
        { id: 'suspend', label: 'Suspend or reinstate listings', risk: 'legal', policy: 'approval', locked: true },
      ], thresholds: [] },
    finance: { gates: [
        { id: 'capture', label: 'Capture pre-authorized payments', risk: 'internal_write', policy: 'auto' },
        { id: 'payout', label: 'Release host & provider payouts', risk: 'money_movement', policy: 'approval', locked: true },
        { id: 'refund', label: 'Execute approved refunds', risk: 'money_movement', policy: 'approval', locked: true },
      ], thresholds: [] },
    support: { gates: [
        { id: 'route', label: 'Route & tag tickets', risk: 'internal_write', policy: 'auto' },
        { id: 'reply', label: 'Send support replies', risk: 'outbound', policy: 'approval' },
        { id: 'faq_auto', label: 'Auto-send vetted FAQ answers', risk: 'outbound', policy: 'off' },
      ], thresholds: [
        { id: 'sla', label: 'First-response SLA (minutes)', value: 15, min: 5, max: 120, step: 5 },
      ] },
    monitor: { gates: [
        { id: 'scan', label: 'Scan funnel & agent health', risk: 'read', policy: 'auto' },
        { id: 'open_esc', label: 'Open escalations for you', risk: 'internal_write', policy: 'auto' },
      ], thresholds: [
        { id: 'sensitivity', label: 'Anomaly sensitivity (1 calm – 5 strict)', value: 3, min: 1, max: 5, step: 1 },
      ] },
  };

  window.MC_DATA.POLICIES = POLICIES;
})();
