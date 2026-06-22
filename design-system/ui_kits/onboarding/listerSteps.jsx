/* Onboarding — venue host (property lister) steps. */
const VENUE_TYPES = ['rooftop', 'warehouse', 'field', 'hall', 'pool house', 'parking lot', 'garden', 'studio', 'loft', 'barn'];
const AMENITIES = ['Parking', 'Restrooms', 'Kitchen', 'WiFi', 'A/V system', 'Tables & chairs', 'Stage', 'Outdoor space', 'Heating / AC', 'Loading dock'];

function Chips({ options, value = [], onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)} style={{
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            padding: '7px 13px', borderRadius: 'var(--radius-full)',
            border: `1px solid ${on ? 'var(--primary-500)' : 'var(--border-strong)'}`,
            background: on ? 'var(--primary-50)' : '#fff', color: on ? 'var(--primary-700)' : 'var(--neutral-600)',
          }}>{on ? '✓ ' : ''}{o}</button>
        );
      })}
    </div>
  );
}

function PhotoGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{
          aspectRatio: '4 / 3', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-strong)',
          background: i === 0 ? 'var(--primary-50)' : 'var(--neutral-50)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: 'var(--text-subtle)',
        }}>
          <span style={{ fontSize: 22, color: i === 0 ? 'var(--primary-400)' : 'var(--neutral-300)' }}>+</span>
          {i === 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary-600)' }}>Cover photo</span>}
        </div>
      ))}
    </div>
  );
}

window.LISTER_STEPS = [
  {
    id: 'basics', label: 'Basics',
    render: ({ d, set }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Tell us about your space</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>The essentials renters search by.</p>
        <Field label="Space name"><input style={window.OB_INPUT} value={d.name || ''} placeholder="e.g. Skyline Rooftop Loft" onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Space type">
          <select style={{ ...window.OB_INPUT, appearance: 'none' }} value={d.type || ''} onChange={(e) => set('type', e.target.value)}>
            <option value="" disabled>Choose a type…</option>
            {VENUE_TYPES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Field label="City"><input style={window.OB_INPUT} value={d.city || ''} placeholder="Austin" onChange={(e) => set('city', e.target.value)} /></Field>
          <Field label="State"><input style={window.OB_INPUT} value={d.state || ''} placeholder="TX" onChange={(e) => set('state', e.target.value)} /></Field>
        </div>
      </div>
    ),
  },
  {
    id: 'details', label: 'Details',
    render: ({ d, set }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Space details</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>Capacity, amenities, and the pitch.</p>
        <Field label="Maximum capacity (guests)"><input type="number" style={window.OB_INPUT} value={d.capacity || ''} placeholder="80" onChange={(e) => set('capacity', e.target.value)} /></Field>
        <Field label="Amenities"><Chips options={AMENITIES} value={d.amenities || []} onToggle={(a) => set('amenities', (d.amenities || []).includes(a) ? d.amenities.filter((x) => x !== a) : [...(d.amenities || []), a])} /></Field>
        <Field label="Description">
          <textarea style={{ ...window.OB_INPUT, minHeight: 96, resize: 'vertical' }} value={d.description || ''} placeholder="Describe the vibe, the views, what makes it special…" onChange={(e) => set('description', e.target.value)} />
        </Field>
        <AIAssist action={<button onClick={() => set('description', `A standout ${d.type || 'space'} in ${d.city || 'town'} with room for up to ${d.capacity || '—'} guests. Flexible by the hour, fully insured, and ready for everything from intimate gatherings to full-scale events.`)} style={{ marginTop: 10, border: 'none', background: 'var(--primary-500)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>✦ Draft it for me</button>}>
          Stuck on wording? I can draft a polished description from your details — then you edit anything you like.
        </AIAssist>
      </div>
    ),
  },
  {
    id: 'photos', label: 'Photos',
    render: () => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Add photos</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>Listings with 5+ photos book 2× faster. Drag your best shot to the cover slot.</p>
        <PhotoGrid />
        <AIAssist label="Trust & Safety">Photos are auto-checked for quality and to confirm they match your space type before your listing goes live.</AIAssist>
      </div>
    ),
  },
  {
    id: 'pricing', label: 'Pricing',
    render: ({ d, set }) => {
      const base = { rooftop: 120, warehouse: 180, field: 90, hall: 160, 'pool house': 110, 'parking lot': 75 }[d.type] || 100;
      const suggested = base + Math.round((Number(d.capacity || 0)) / 10) * 5;
      return (
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Set your rate</h2>
          <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>You can change this anytime. VenuePlus adds its fee on top.</p>
          <Field label="Hourly rate (USD)">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15 }}>$</span>
              <input type="number" style={{ ...window.OB_INPUT, paddingLeft: 26 }} value={d.price || ''} placeholder={String(suggested)} onChange={(e) => set('price', e.target.value)} />
            </div>
          </Field>
          <AIAssist action={<button onClick={() => set('price', suggested)} style={{ marginTop: 10, border: 'none', background: 'var(--primary-500)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Use ${suggested}/hr</button>}>
            Based on <strong>6 similar {d.type || 'spaces'}</strong> near {d.city || 'you'}, I suggest <strong>${suggested}/hr</strong> — competitive while maximizing your bookings.
          </AIAssist>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 8 }}>Required services for every booking</div>
            {[['security', 'Security', true], ['cleaning', 'Cleaning', true], ['insurance', 'Event insurance', true]].map(([id, label, def]) => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', fontSize: 14, color: 'var(--neutral-700)' }}>
                <input type="checkbox" defaultChecked={def} style={{ width: 17, height: 17, accentColor: 'var(--primary-500)' }} />
                {label} <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>— auto-matched from our provider network</span>
              </label>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    id: 'review', label: 'Review',
    render: ({ d }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Review &amp; publish</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>Here’s what renters will see. Publish to send it for a quick approval.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {[['Name', d.name], ['Type', d.type], ['Location', d.city ? `${d.city}, ${d.state || ''}` : ''], ['Capacity', d.capacity ? `${d.capacity} guests` : ''], ['Rate', d.price ? `$${d.price}/hr` : ''], ['Amenities', (d.amenities || []).join(', ')]].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 14px', borderTop: i ? '1px solid var(--border-hairline)' : 'none', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: v ? 'var(--neutral-800)' : 'var(--text-subtle)', fontWeight: 500, textAlign: 'right', textTransform: k === 'Type' ? 'capitalize' : 'none' }}>{v || 'Not set'}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];
