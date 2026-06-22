# Marketplace — Consumer UI kit

The customer-facing booking product — the marketplace the agent fleet exists to grow. "Airbnb for events + TaskRabbit for services": rent commercial spaces by the hour and bundle in vetted services (cleaning, security, food trucks, insurance) in one transaction.

## Screens (one interactive app — `index.html`)
- **Home** — navy→orange hero with the pill search bar, venue-type grid, featured venues, and the service-category cards.
- **Search** — filter bar + pill category tabs over a responsive venue-card grid.
- **Venue Detail** — gallery, key stats, mandatory required-services list, and a sticky **booking panel** (duration stepper, optional add-on services, live cost breakdown → confirmation).

## Built from
`Card` (interactive hover-lift), `Badge` (category + status), `Button` (orange "Book Now" CTA), `Input`, `Select`, `Tabs`, `Checkbox`.

Venue imagery uses the app's authentic navy→orange gradient fallback (the real product's empty-photo state).

## Files
`index.html` · `data.js` · `Site.jsx` (navbar + footer) · `screens.jsx` (Home + Search) · `Detail.jsx` · `App.jsx`

Recreated from `frontend/app/page.tsx`, `venues/`, and `components/VenueCard.tsx` in the source repo.
