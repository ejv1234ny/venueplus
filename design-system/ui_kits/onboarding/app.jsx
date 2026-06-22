/* Onboarding — root flow: choose persona → guided wizard → submitted. */
const { useState: useFlowState } = React;

function OnboardApp() {
  const { Button } = window.VenuePlusDesignSystem_17f1a7;
  const [phase, setPhase] = useFlowState('choose'); // choose | flow | done
  const [persona, setPersona] = useFlowState(null);  // lister | provider
  const [step, setStep] = useFlowState(0);
  const [data, setData] = useFlowState({});

  const steps = persona === 'lister' ? window.LISTER_STEPS : window.PROVIDER_STEPS;
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const reset = () => { setData({}); setStep(0); setPersona(null); setPhase('choose'); };
  const start = (p) => { setPersona(p); setStep(0); setData({}); setPhase('flow'); };

  const isLast = step === steps.length - 1;
  const next = () => { if (isLast) { setPhase('done'); window.scrollTo(0, 0); } else { setStep((s) => s + 1); } };
  const back = () => { if (step === 0) { reset(); } else { setStep((s) => s - 1); } };

  const title = persona === 'lister' ? 'List your space' : persona === 'provider' ? 'Join as a service provider' : 'Get started with VenuePlus';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-console)', fontFamily: 'var(--font-sans)' }}>
      {/* header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-default)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 34 }} />
          <span style={{ fontSize: 17, fontWeight: 700 }}><span style={{ color: 'var(--primary-500)' }}>Venue</span><span style={{ color: 'var(--accent-500)' }}>Plus</span></span>
        </div>
        {phase === 'flow' && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Step {step + 1} of {steps.length}</span>}
        {phase !== 'choose' && <button onClick={reset} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13.5, fontFamily: 'var(--font-sans)' }}>Exit</button>}
      </header>

      {/* CHOOSE */}
      {phase === 'choose' && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', textAlign: 'center' }}>Turn your space or service into income</h1>
          <p style={{ margin: '0 0 36px', fontSize: 17, color: 'var(--text-muted)', textAlign: 'center' }}>Tell us what you offer. Our Onboarding agent guides the rest — drafting copy, suggesting pricing, and getting you live fast.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <ChoiceCard title="List a space" accent="var(--primary-500)"
              desc="Rent your venue out by the hour — rooftops, warehouses, fields, halls, and more."
              points={['Set your own hourly rate', 'AI-suggested pricing from local comps', 'Security, cleaning & insurance auto-bundled']}
              onClick={() => start('lister')} />
            <ChoiceCard title="Offer a service" accent="var(--accent-500)"
              desc="Get matched to events that need you — cleaning, security, catering, DJs, and more."
              points={['Choose your service area & radius', 'Auto-matched to nearby bookings', 'Verified badge once approved']}
              onClick={() => start('provider')} />
          </div>
        </div>
      )}

      {/* FLOW */}
      {phase === 'flow' && (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          <div>
            <Stepper steps={steps} current={step} />
            <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
              {steps[step].render({ d: data, set })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
              <Button variant="ghost" onClick={back}>{step === 0 ? '← Back' : '← Previous'}</Button>
              <Button variant={isLast ? 'accent' : 'primary'} onClick={next}>{isLast ? (persona === 'lister' ? 'Publish listing' : 'Submit for review') : 'Continue →'}</Button>
            </div>
          </div>

          {/* live preview */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>Live preview</div>
            {persona === 'lister' ? <VenuePreview d={data} /> : <ProviderPreview d={data} />}
            <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--primary-500)' }}>✦</span>
              <span>Your Onboarding agent fills gaps, checks completeness, and prepares this for the operator’s quick approval.</span>
            </div>
          </div>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 32, color: 'var(--status-success-fg)' }}>✓</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800 }}>{persona === 'lister' ? 'Listing submitted!' : 'Profile submitted!'}</h1>
          <p style={{ margin: '0 0 24px', fontSize: 15.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {persona === 'lister'
              ? 'Your Onboarding agent has prepared the listing. It goes to the operator for a quick approval, then it’s live and bookable.'
              : 'Your Trust & Safety check is running now. Once your license and insurance are verified and approved, you’ll start getting matched to nearby bookings.'}
          </p>
          <div style={{ maxWidth: 320, margin: '0 auto 24px' }}>
            {persona === 'lister' ? <VenuePreview d={data} /> : <ProviderPreview d={data} />}
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'left', marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>What happens next</div>
            {(persona === 'lister'
              ? [['✦', 'Onboarding agent finalizes your profile & pricing'], ['⛨', 'Trust & Safety verifies photos & insurance'], ['✓', 'Operator approves — you go live']]
              : [['⛨', 'Trust & Safety verifies license & insurance'], ['✦', 'Provider Network adds you to coverage'], ['✓', 'Operator approves — you start matching']]
            ).map(([icon, t], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 14, color: 'var(--neutral-700)' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{icon}</span>
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="outline" onClick={reset}>List something else</Button>
            <Button variant="primary" onClick={reset}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<OnboardApp />);
