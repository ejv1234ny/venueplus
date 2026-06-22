// Popular amenities per venue category, used by the venue submission page.
// Each list is capped to the 25 most relevant amenities for that space type.

const COMMON: string[] = [
  'Restrooms',
  'On-site parking',
  'WiFi',
  'Tables & chairs',
  'Event lighting',
  'Power outlets / generator',
  'Sound system',
  'Wheelchair accessible',
  'On-site staff / host',
  'Security cameras',
  'Trash & recycling',
  'Setup & teardown allowed',
  'Catering / prep area',
  'Drinking water',
  'Wedding / ceremony friendly',
];

const SPECIFIC: Record<string, string[]> = {
  rooftop: [
    'Skyline / city views',
    'Covered / shaded area',
    'Outdoor heaters',
    'Bar area',
    'Lounge furniture',
    'Elevator access',
    'String / ambient lighting',
    'Fire pit',
    'Wind screens',
    'Retractable canopy',
  ],
  field: [
    'Open green space',
    'Tent / marquee friendly',
    'Vehicle / trailer access',
    'Natural shade (trees)',
    'Stage area',
    'Portable toilet hookups',
    'Fenced perimeter',
    'Fire / bonfire allowed',
    'Camping allowed',
    'Livestock / pet friendly',
  ],
  'pool house': [
    'Swimming pool',
    'Hot tub / spa',
    'Poolside loungers',
    'Outdoor shower',
    'Changing rooms',
    'Cabana / shaded seating',
    'BBQ / grill',
    'Outdoor kitchen',
    'Towel service',
    'Lifeguard available',
  ],
  'parking lot': [
    'Large open paved area',
    'Drive-in vehicle access',
    'EV charging',
    'Overnight access',
    'Gated / secured entry',
    'Floodlighting',
    'Loading dock / ramp',
    'Marked spaces',
    'Food truck friendly',
    'Covered sections',
  ],
  warehouse: [
    'High ceilings',
    'Open floor plan',
    'Loading dock',
    'Freight elevator',
    'Industrial / exposed look',
    'Blackout capability',
    'Heating',
    'Air conditioning',
    'Forklift / equipment access',
    'Green room / back area',
  ],
  garden: [
    'Manicured lawn',
    'Flower beds / landscaping',
    'Gazebo / pergola',
    'Water feature / fountain',
    'Shaded seating',
    'Garden lighting',
    'Greenhouse / conservatory',
    'Stone / paved pathways',
    'Outdoor power',
    'Pet friendly',
  ],
  other: [
    'Flexible layout',
    'Indoor & outdoor space',
    'Stage / performance area',
    'Dance floor',
    'Dressing / green room',
    'Coat check',
    'Projector / AV',
    'Bar area',
    'Kitchen access',
    'Loading access',
  ],
};

export function amenitiesForType(venueType: string): string[] {
  const specific = SPECIFIC[venueType] ?? SPECIFIC.other;
  // Specific first, then common; dedupe; cap at 25.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of [...specific, ...COMMON]) {
    if (!seen.has(a)) {
      seen.add(a);
      out.push(a);
    }
  }
  return out.slice(0, 25);
}
