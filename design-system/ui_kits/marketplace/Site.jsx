/* Marketplace shared chrome: Navbar, Footer, VenueThumb. */
function Navbar({ onNav, authed, onSearch }) {
  return (
    <nav style={{ background: '#fff', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onNav('home')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 38, width: 'auto' }} />
          <span style={{ fontSize: 22, fontWeight: 700 }}><span style={{ color: 'var(--primary-500)' }}>Venue</span><span style={{ color: 'var(--accent-500)' }}>Plus</span></span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button onClick={() => onNav('search')} style={navLink}>Venues</button>
          <button onClick={() => onNav('search')} style={navLink}>Services</button>
          <a href="#" style={navLink}>Log in</a>
          <span style={{ background: 'var(--primary-500)', color: '#fff', padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Sign up</span>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const cols = [
    ['For Renters', ['Browse Venues', 'Find Services', 'My Bookings']],
    ['For Hosts', ['List Your Space', 'Offer Services', 'Dashboard']],
    ['Company', ['About', 'Help Center', 'Contact']],
  ];
  return (
    <footer style={{ background: 'var(--surface-footer)', color: '#fff', padding: '48px 24px 32px', marginTop: 64 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32 }}>
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700 }}>VenuePlus</h3>
          <p style={{ margin: 0, color: 'var(--neutral-400)', fontSize: 14, maxWidth: '32ch' }}>The easiest way to book unique spaces and essential services for your events.</p>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600 }}>{h}</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((i) => <li key={i} style={{ color: 'var(--neutral-400)', fontSize: 14 }}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1120, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid var(--neutral-800)', textAlign: 'center', color: 'var(--neutral-400)', fontSize: 13 }}>
        © 2026 VenuePlus. All rights reserved.
      </div>
    </footer>
  );
}

function VenueThumb({ venue, height = 180 }) {
  return (
    <div style={{ height, background: `linear-gradient(135deg, ${venue.grad[0]}, ${venue.grad[1]})`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,.45)', fontSize: 44, fontWeight: 700 }}>V+</span>
      <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,.92)', color: 'var(--neutral-800)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}>{venue.type}</span>
    </div>
  );
}

const navLink = { border: 'none', background: 'none', cursor: 'pointer', font: 'inherit', fontSize: 15, fontWeight: 500, color: 'var(--neutral-700)', fontFamily: 'var(--font-sans)' };

Object.assign(window, { Navbar, Footer, VenueThumb });
