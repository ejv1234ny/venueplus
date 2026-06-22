/* Onboarding — service provider steps. */
const SERVICE_CATS = ['cleaning', 'security', 'catering', 'bartending', 'dj', 'photography', 'decoration', 'equipment', 'staff'];

function CatGrid({ value, onPick }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {SERVICE_CATS.map((c) => {
        const on = value === c;
        return (
          <button key={c} onClick={() => onPick(c)} style={{
            cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: '12px 8px', borderRadius: 'var(--radius-md)',
            border: `2px solid ${on ? 'var(--primary-500)' : 'var(--border-default)'}`,
            background: on ? 'var(--primary-50)' : '#fff', display: 'flex', justifyContent: 'center',
          }}>
            <Badge category={c} />
          </button>
        );
      })}
    </div>
  );
}

window.PROVIDER_STEPS = [
  {
    id: 'business', label: 'Business',
    render: ({ d, set }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Tell us about your service</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>We’ll match you to events that need exactly what you offer.</p>
        <Field label="Business name"><input style={window.OB_INPUT} value={d.name || ''} placeholder="e.g. Lone Star Event Security" onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="What service do you provide?"><CatGrid value={d.category} onPick={(c) => set('category', c)} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginTop: 16 }}>
          <Field label="Service area (city)"><input style={window.OB_INPUT} value={d.area || ''} placeholder="Austin, TX" onChange={(e) => set('area', e.target.value)} /></Field>
          <Field label="Radius (mi)"><input type="number" style={window.OB_INPUT} value={d.radius || ''} placeholder="25" onChange={(e) => set('radius', e.target.value)} /></Field>
        </div>
      </div>
    ),
  },
  {
    id: 'coverage', label: 'Coverage',
    render: ({ d, set }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Capacity &amp; coverage</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>How much can you take on?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Team size"><input type="number" style={window.OB_INPUT} value={d.team || ''} placeholder="6" onChange={(e) => set('team', e.target.value)} /></Field>
          <Field label="Max simultaneous jobs"><input type="number" style={window.OB_INPUT} value={d.maxJobs || ''} placeholder="3" onChange={(e) => set('maxJobs', e.target.value)} /></Field>
        </div>
        <Field label="What you offer">
          <textarea style={{ ...window.OB_INPUT, minHeight: 90, resize: 'vertical' }} value={d.description || ''} placeholder="Describe your service, experience, and what sets you apart…" onChange={(e) => set('description', e.target.value)} />
        </Field>
        <AIAssist action={<button onClick={() => set('description', `Licensed, insured ${d.category || 'event'} professionals serving ${d.area || 'the area'}. ${d.team || 'Our'}-person team with a track record of reliable, on-time service for events of every size.`)} style={{ marginTop: 10, border: 'none', background: 'var(--primary-500)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>✦ Draft it for me</button>}>
          I can write a strong service summary from your details — edit anything before it goes live.
        </AIAssist>
      </div>
    ),
  },
  {
    id: 'credentials', label: 'Credentials',
    render: ({ d, set }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Licensing &amp; insurance</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>Required to keep the marketplace safe. Verified before your first job.</p>
        <Field label="Business license #"><input style={window.OB_INPUT} value={d.license || ''} placeholder="TX-000000000" onChange={(e) => set('license', e.target.value)} /></Field>
        <Field label="Proof of insurance">
          <button onClick={() => set('insured', !d.insured)} style={{
            width: '100%', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: '16px', borderRadius: 'var(--radius-md)',
            border: `2px dashed ${d.insured ? 'var(--status-success-fg)' : 'var(--border-strong)'}`,
            background: d.insured ? 'var(--status-success-bg)' : 'var(--neutral-50)', color: d.insured ? 'var(--status-success-fg)' : 'var(--text-muted)',
            fontSize: 13.5, fontWeight: 600,
          }}>{d.insured ? '✓ certificate_of_insurance.pdf uploaded' : '+ Upload insurance certificate (PDF)'}</button>
        </Field>
        <AIAssist label="Trust & Safety">Your license and insurance certificate are validated automatically. A flagged or expired document is escalated to the operator before you can take jobs — this protects every booking.</AIAssist>
      </div>
    ),
  },
  {
    id: 'pricing', label: 'Pricing',
    render: ({ d, set }) => {
      const base = { security: 55, cleaning: 40, catering: 75, bartending: 50, dj: 75, photography: 90, decoration: 45, equipment: 35, staff: 30 }[d.category] || 50;
      return (
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Set your rate</h2>
          <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>What you charge per hour. Change it anytime.</p>
          <Field label="Hourly rate (USD)">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15 }}>$</span>
              <input type="number" style={{ ...window.OB_INPUT, paddingLeft: 26 }} value={d.rate || ''} placeholder={String(base)} onChange={(e) => set('rate', e.target.value)} />
            </div>
          </Field>
          <AIAssist action={<button onClick={() => set('rate', base)} style={{ marginTop: 10, border: 'none', background: 'var(--primary-500)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Use ${base}/hr</button>}>
            {d.category ? <span><strong>{d.category[0].toUpperCase() + d.category.slice(1)}</strong> providers in {d.area || 'your area'} typically charge around <strong>${base}/hr</strong>.</span> : 'Pick a service category and I’ll suggest a competitive rate.'}
          </AIAssist>
        </div>
      );
    },
  },
  {
    id: 'review', label: 'Review',
    render: ({ d }) => (
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Review &amp; submit</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)' }}>Submit to send your profile for verification &amp; a quick approval.</p>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {[['Business', d.name], ['Service', d.category], ['Area', d.area ? `${d.area}${d.radius ? ` · ${d.radius} mi` : ''}` : ''], ['Team', d.team ? `${d.team} people` : ''], ['Rate', d.rate ? `$${d.rate}/hr` : ''], ['Insurance', d.insured ? 'Uploaded' : 'Missing']].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 14px', borderTop: i ? '1px solid var(--border-hairline)' : 'none', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: v ? 'var(--neutral-800)' : 'var(--text-subtle)', fontWeight: 500, textAlign: 'right', textTransform: k === 'Service' ? 'capitalize' : 'none' }}>{v || 'Not set'}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];
