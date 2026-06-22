/* Marketplace app: routes between Home, Search, and Venue Detail. */
const { useState: useMarketState } = React;

function MarketApp() {
  const [route, setRoute] = useMarketState('home');
  const [venueId, setVenueId] = useMarketState(null);
  const venue = window.MP_DATA.VENUES.find((v) => v.id === venueId);

  const openVenue = (id) => { setVenueId(id); setRoute('detail'); window.scrollTo(0, 0); };
  const nav = (r) => { setRoute(r); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar onNav={nav} />
      {route === 'home' && <Home onNav={nav} onOpenVenue={openVenue} />}
      {route === 'search' && <Search onOpenVenue={openVenue} />}
      {route === 'detail' && venue && <VenueDetail venue={venue} onBack={() => nav('search')} />}
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MarketApp />);
