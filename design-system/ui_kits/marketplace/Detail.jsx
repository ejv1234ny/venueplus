/* Marketplace venue detail + booking panel. */
const { useState: useDetailState } = React;

function VenueDetail({ venue, onBack }) {
  const { REQUIRED } = window.MP_DATA;
  const { Badge, Button, Checkbox } = window.VenuePlusDesignSystem_17f1a7;
  const [hours, setHours] = useDetailState(4);
  const [extras, setExtras] = useDetailState({ dj: false, photography: false });
  const [booked, setBooked] = useDetailState(false);

  const reqCost = REQUIRED.reduce((s, r) => s + r.rate * hours, 0);
  const extraRates = { dj: 75, photography: 90 };
  const extraCost = Object.entries(extras).filter(([, on]) => on).reduce((s, [k]) => s + extraRates[k] * hours, 0);
  const venueCost = venue.price * hours;
  const subtotal = venueCost + reqCost + extraCost;
  const protectionFee = +(subtotal * 0.06).toFixed(2); // VenuePlus liability protection
  const taxRate = 0.0825; // event / sales tax
  const tax = +((subtotal + protectionFee) * taxRate).toFixed(2);
  const total = +(subtotal + protectionFee + tax).toFixed(2);

  if (booked) {
    return (
      <div style={{ maxWidth: 520, margin: '64px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30, color: 'var(--status-success-fg)' }}>✓</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700 }}>Booking confirmed!</h1>
        <p style={{ margin: '0 0 24px', color: 'var(--text-muted)' }}>Your booking for <strong>{venue.title}</strong> is in. Booking #4827.</p>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 24, textAlign: 'left', marginBottom: 24 }}>
          <Row label="Status" value={<Badge status="awaiting_payment">awaiting payment</Badge>} />
          <Row label="Duration" value={`${hours} hours`} />
          <Row label="Venue cost" value={`$${venueCost.toFixed(2)}`} />
          <Row label="Required services" value={`$${reqCost.toFixed(2)}`} />
          {extraCost > 0 && <Row label="Add-on services" value={`$${extraCost.toFixed(2)}`} />}
          <Row label="Liability protection" value={`$${protectionFee.toFixed(2)}`} />
          <Row label="Taxes (8.25%)" value={`$${tax.toFixed(2)}`} />
          <div style={{ borderTop: '1px solid var(--border-hairline)', marginTop: 10, paddingTop: 10 }}>
            <Row label={<strong>Total</strong>} value={<strong style={{ color: 'var(--primary-600)' }}>${total.toFixed(2)}</strong>} />
          </div>
        </div>
        <Button variant="primary" onClick={onBack}>Browse more venues</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px' }}>
      <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-600)', fontSize: 14, padding: 0, marginBottom: 14 }}>← Back to venues</button>
      <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 28 }}>
        <VenueThumb venue={venue} height={340} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
        <div>
          <Badge tone="brand" style={{ marginBottom: 10 }}>{venue.type}</Badge>
          <h1 style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 700 }}>{venue.title}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 22 }}>◌ {venue.city}, {venue.state}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[['Capacity', venue.capacity], ['Per hour', `$${venue.price}`], ['Minimum', '2h'], ['Rating', '4.9']].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{k}</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>About this space</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--neutral-600)', lineHeight: 1.65 }}>
            A standout {venue.type} in {venue.city} with room for up to {venue.capacity} guests. Flexible by the hour, fully insured, and pre-vetted by the VenuePlus fleet.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>⛨ Required services</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REQUIRED.map((r) => (
              <div key={r.cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge category={r.cat} />
                  <span style={{ fontSize: 14 }}>{r.name}</span>
                  <Badge status="cancelled" capitalize={false} style={{ background: 'var(--status-error-bg)', color: 'var(--status-error-fg)' }}>Mandatory</Badge>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>${r.rate}/hr</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 14, background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <span style={{ color: 'var(--primary-600)', fontSize: 16 }}>⛨</span>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--neutral-700)', lineHeight: 1.5 }}>
              <strong>Liability protection included.</strong> Every booking carries VenuePlus event-liability coverage — on top of the host&rsquo;s own insurance policy. The fee is itemized at checkout.
            </p>
          </div>
        </div>

        {/* Booking panel */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: 22, position: 'sticky', top: 88 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>${venue.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> /hour</span></div>
          <div style={{ margin: '16px 0' }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-700)' }}>Duration (hours)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <button onClick={() => setHours((h) => Math.max(2, h - 1))} style={stepBtn}>−</button>
              <span style={{ fontSize: 17, fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{hours}</span>
              <button onClick={() => setHours((h) => h + 1)} style={stepBtn}>+</button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 8 }}>Add optional services</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Checkbox label="DJ — $75/hr" checked={extras.dj} onChange={(e) => setExtras((x) => ({ ...x, dj: e.target.checked }))} />
              <Checkbox label="Photography — $90/hr" checked={extras.photography} onChange={(e) => setExtras((x) => ({ ...x, photography: e.target.checked }))} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-hairline)', margin: '14px 0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Row sm label={`$${venue.price} × ${hours} hrs`} value={`$${venueCost.toFixed(2)}`} />
            <Row sm label="Required services" value={`$${reqCost.toFixed(2)}`} />
            {extraCost > 0 && <Row sm label="Add-ons" value={`$${extraCost.toFixed(2)}`} />}
            <Row sm label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <Row sm label="Liability protection" value={`$${protectionFee.toFixed(2)}`} />
            <p style={{ margin: '1px 0 2px', fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.4 }}>Covers VenuePlus event liability — in addition to the host’s own policy.</p>
            <Row sm label="Taxes (8.25%)" value={`$${tax.toFixed(2)}`} />
            <div style={{ borderTop: '1px solid var(--border-hairline)', marginTop: 6, paddingTop: 8 }}>
              <Row label={<strong>Total</strong>} value={<strong style={{ color: 'var(--primary-600)' }}>${total.toFixed(2)}</strong>} />
            </div>
          </div>
          <Button variant="accent" fullWidth onClick={() => setBooked(true)}>Book Now</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, sm }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: sm ? '0' : '5px 0', fontSize: sm ? 13.5 : 14 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--neutral-800)' }}>{value}</span>
    </div>
  );
}

const stepBtn = { width: 34, height: 34, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', background: '#fff', cursor: 'pointer', fontSize: 18, color: 'var(--neutral-700)' };

Object.assign(window, { VenueDetail });
