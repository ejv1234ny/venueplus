/* Marketplace screens: Home, Search, Venue Detail. */
const { useState: useMpState } = React;

function Home({ onNav, onOpenVenue }) {
  const { VENUE_TYPES, SERVICES, VENUES } = window.MP_DATA;
  const { Card, Badge, Button } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--gradient-hero)', color: '#fff', padding: '72px 24px 88px', position: 'relative' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 50, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-.02em' }}>
            Find your perfect event space
            <span style={{ display: 'block', color: 'var(--accent-200)' }}>+ essential services</span>
          </h1>
          <p style={{ margin: '20px auto 32px', fontSize: 20, color: 'var(--primary-50)', maxWidth: '46ch' }}>
            From rooftop picnics to classic car shows. Book unique venues and everything you need — in one place.
          </p>
          <div onClick={() => onNav('search')} style={{ background: '#fff', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-2xl)', padding: 8, display: 'flex', alignItems: 'center', maxWidth: 560, margin: '0 auto', cursor: 'pointer' }}>
            <span style={{ color: 'var(--neutral-400)', padding: '0 8px 0 16px', fontSize: 18 }}>⌕</span>
            <span style={{ flex: 1, textAlign: 'left', color: 'var(--neutral-400)', fontSize: 15 }}>Search venues by location or type…</span>
            <span style={{ background: 'var(--accent-500)', color: '#fff', padding: '11px 24px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>Search</span>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', color: 'var(--primary-100)', fontSize: 14 }}>
            <span>✓ Trusted Venues</span><span>✓ Verified Services</span><span>✓ Seamless Booking</span>
          </div>
        </div>
      </section>

      <Section title="Explore unique spaces" subtitle="Find the perfect venue for any occasion">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {VENUE_TYPES.map((t) => (
            <Card key={t.name} interactive padding="md" style={{ textAlign: 'center' }} onClick={() => onNav('search')}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-900)' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t.count} venues</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Featured venues" subtitle="Hand-picked spaces ready to book" bg="var(--neutral-50)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {VENUES.slice(0, 3).map((v) => <VenueCard key={v.id} venue={v} onOpen={onOpenVenue} />)}
        </div>
      </Section>

      <Section title="Essential services" subtitle="Book everything you need in one place">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {SERVICES.map((s) => (
            <Card key={s.name} interactive padding="md" onClick={() => onNav('search')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{s.name}</h3>
                <Badge category={s.cat} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Search({ onOpenVenue }) {
  const { VENUES } = window.MP_DATA;
  const { Input, Select, Tabs, Button } = window.VenuePlusDesignSystem_17f1a7;
  const [type, setType] = useMpState('all');
  const types = ['all', 'rooftop', 'warehouse', 'field', 'hall', 'pool house', 'parking lot'];
  const shown = type === 'all' ? VENUES : VENUES.filter((v) => v.type === type);
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 700 }}>Find a venue</h1>
      <p style={{ margin: '0 0 22px', fontSize: 17, color: 'var(--text-muted)' }}>{shown.length} spaces in Austin, TX</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ width: 220 }}><Input label="Search" placeholder="Rooftop, warehouse…" /></div>
        <div style={{ width: 160 }}><Input label="Max $/hr" type="number" placeholder="200" /></div>
        <div style={{ width: 160 }}>
          <Select label="Sort" options={[{ value: 'rel', label: 'Relevance' }, { value: 'price', label: 'Price ↑' }, { value: 'cap', label: 'Capacity' }]} />
        </div>
        <Button variant="primary">Search</Button>
      </div>
      <div style={{ marginBottom: 22 }}>
        <Tabs value={type} onChange={setType} items={types.map((t) => ({ value: t, label: t === 'all' ? 'All' : t, capitalize: true }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {shown.map((v) => <VenueCard key={v.id} venue={v} onOpen={onOpenVenue} />)}
      </div>
    </div>
  );
}

function VenueCard({ venue, onOpen }) {
  const { Card } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <Card interactive padding="none" onClick={() => onOpen(venue.id)}>
      <VenueThumb venue={venue} />
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--neutral-900)' }}>{venue.title}</h3>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 3 }}>◌ {venue.city}, {venue.state}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-hairline)' }}>
          <span style={{ fontSize: 13.5, color: 'var(--neutral-600)' }}>Up to {venue.capacity}</span>
          <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>${venue.price}<span style={{ color: 'var(--text-subtle)', fontWeight: 400, fontSize: 13 }}>/hr</span></span>
        </div>
      </div>
    </Card>
  );
}

function Section({ title, subtitle, children, bg = '#fff' }) {
  return (
    <section style={{ background: bg, padding: '56px 24px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, textAlign: 'center' }}>{title}</h2>
        {subtitle && <p style={{ margin: '8px 0 32px', fontSize: 17, color: 'var(--text-muted)', textAlign: 'center' }}>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

Object.assign(window, { Home, Search, VenueCard, Section });
