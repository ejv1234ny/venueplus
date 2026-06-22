/* Finance & Payouts — escrow + multi-party payout data.
   Flow: renter pays (venue + services + fee) → held in escrow → after the
   event and dispute window → released to host, providers, and platform. */
(function () {
  const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // The canonical escrow breakdown for one booking (used by the flow diagram).
  const SAMPLE = {
    id: 1204, renter: 'Jordan Lee', venue: 'The Cathedral Hall', host: 'Marcus Reed',
    event: 'Jun 28, 2026', hours: 5, releaseOn: 'Jun 29',
    venueRate: 160, feePct: 14,
    services: [
      { name: 'Lone Star Event Security', cat: 'security', rate: 55 },
      { name: 'SpotOn Cleaning Co.', cat: 'cleaning', rate: 40 },
    ],
  };

  // Escrow ledger — money currently in / moving through escrow.
  const LEDGER = [
    { id: 1204, renter: 'Jordan Lee', venue: 'The Cathedral Hall', event: 'Jun 28', total: 1453.50, host: 800, fee: 178.50, services: [['security', 275], ['cleaning', 200]], status: 'held' },
    { id: 1201, renter: 'Priya N.', venue: 'Skyline Rooftop Loft', event: 'Jun 24', total: 996.55, host: 600, fee: 122.30, services: [['dj', 274.25]], status: 'releasable' },
    { id: 1199, renter: 'Diego M.', venue: 'East Side Warehouse', event: 'Jun 22', total: 1881.00, host: 900, fee: 231.00, services: [['security', 330], ['catering', 420]], status: 'releasable' },
    { id: 1188, renter: 'Sam Ortiz', venue: 'Wildflower Field', event: 'Jun 20', total: 640.00, host: 450, fee: 78.50, services: [['cleaning', 111.50]], status: 'disputed' },
    { id: 1175, renter: 'Casey R.', venue: 'Lakeside Pool House', event: 'Jun 14', total: 742.00, host: 440, fee: 91.00, services: [['photography', 211]], status: 'released' },
    { id: 1168, renter: 'Avery T.', venue: 'The Cathedral Hall', event: 'Jun 10', total: 1338.00, host: 800, fee: 164.00, services: [['security', 220], ['bartending', 154]], status: 'released' },
  ];

  const OPERATOR_YTD = {
    gmv: 312480, fees: 43747, inEscrow: 4971.05, releasable: 2877.55, releasedYtd: 268010, disputes: 1,
    monthly: [38200, 44100, 49800, 52600, 61200, 66580], // Jan–Jun GMV
  };

  const HOST = {
    name: 'Marcus Reed', venue: 'The Cathedral Hall',
    ytd: { earnings: 19900, bookings: 24, avg: 829, nextPayout: 800, nextDate: 'Jun 29', inEscrow: 1600, occupancy: 71 },
    monthly: [2400, 3100, 2800, 3600, 4200, 3800],
    bookings: [
      { id: 1204, event: 'Jun 28', renter: 'Jordan Lee', gross: 800, payout: 800, status: 'held' },
      { id: 1168, event: 'Jun 10', renter: 'Avery T.', gross: 800, payout: 800, status: 'released' },
      { id: 1142, event: 'May 31', renter: 'Lena P.', gross: 640, payout: 640, status: 'released' },
      { id: 1120, event: 'May 18', renter: 'Tom B.', gross: 960, payout: 960, status: 'released' },
    ],
  };

  const PROVIDER = {
    name: 'Lone Star Event Security', cat: 'security',
    ytd: { earnings: 14750, jobs: 58, avg: 254, nextPayout: 275, nextDate: 'Jun 29', inEscrow: 605, rating: 4.9 },
    monthly: [1800, 2200, 2600, 2400, 3000, 2750],
    jobs: [
      { id: 1204, event: 'Jun 28', venue: 'The Cathedral Hall', hours: 5, payout: 275, status: 'held' },
      { id: 1199, event: 'Jun 22', venue: 'East Side Warehouse', hours: 6, payout: 330, status: 'releasable' },
      { id: 1168, event: 'Jun 10', venue: 'The Cathedral Hall', hours: 4, payout: 220, status: 'released' },
      { id: 1131, event: 'May 24', venue: 'Skyline Rooftop Loft', hours: 5, payout: 275, status: 'released' },
    ],
  };

  window.FIN = { money, SAMPLE, LEDGER, OPERATOR_YTD, HOST, PROVIDER };
})();
