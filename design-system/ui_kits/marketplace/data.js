/* Marketplace — simulated venue & service data for the consumer-facing kit. */
(function () {
  const VENUES = [
    { id: 1, title: 'Skyline Rooftop Loft', type: 'rooftop', city: 'Austin', state: 'TX', capacity: 80, price: 120, grad: ['#007db1', '#ff6946'] },
    { id: 2, title: 'East Side Warehouse', type: 'warehouse', city: 'Austin', state: 'TX', capacity: 250, price: 180, grad: ['#00648e', '#3397c1'] },
    { id: 3, title: 'Wildflower Field', type: 'field', city: 'Dripping Springs', state: 'TX', capacity: 300, price: 90, grad: ['#3397c1', '#ff876b'] },
    { id: 4, title: 'The Cathedral Hall', type: 'hall', city: 'Austin', state: 'TX', capacity: 150, price: 160, grad: ['#ff6946', '#cc5438'] },
    { id: 5, title: 'Lakeside Pool House', type: 'pool house', city: 'Lakeway', state: 'TX', capacity: 40, price: 110, grad: ['#007db1', '#66b1d0'] },
    { id: 6, title: 'Downtown Parking Deck', type: 'parking lot', city: 'Austin', state: 'TX', capacity: 200, price: 75, grad: ['#004b6a', '#007db1'] },
  ];

  const VENUE_TYPES = [
    { name: 'Rooftops', count: '150+' }, { name: 'Fields', count: '200+' },
    { name: 'Pool Houses', count: '80+' }, { name: 'Parking Lots', count: '120+' },
    { name: 'Warehouses', count: '90+' }, { name: 'Gardens', count: '110+' },
  ];

  const SERVICES = [
    { name: 'Cleaning', cat: 'cleaning', desc: 'Pre & post-event cleaning crews' },
    { name: 'Catering', cat: 'catering', desc: 'Food trucks & full-service catering' },
    { name: 'Security', cat: 'security', desc: 'Licensed event security teams' },
    { name: 'DJ Services', cat: 'dj', desc: 'Professional entertainers' },
    { name: 'Bartending', cat: 'bartending', desc: 'Certified bartenders' },
    { name: 'Photography', cat: 'photography', desc: 'Capture every moment' },
  ];

  const REQUIRED = [
    { cat: 'security', name: 'Lone Star Event Security', rate: 55, mandatory: true },
    { cat: 'cleaning', name: 'SpotOn Cleaning Co.', rate: 40, mandatory: true },
  ];

  window.MP_DATA = { VENUES, VENUE_TYPES, SERVICES, REQUIRED };
})();
