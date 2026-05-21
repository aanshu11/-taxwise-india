import { useTaxStore } from '../store/useTaxStore';

function LandingPage() {
  const setView = useTaxStore((state) => state.setView);

  return (
    <div className="landing-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '16px 0' }}>
      
      {/* Hero Section */}
      <section className="hero-section" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ fontSize: '3rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.15' }}>
          Find out which tax regime saves you{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            more money
          </span>.
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Simple tax comparison for salaried employees in under 3 minutes.
        </p>
        <div style={{ marginTop: '16px' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '16px 36px', fontSize: '1.15rem' }}
            onClick={() => setView('wizard')}
          >
            Check My Tax &rarr;
          </button>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🔒</span>
          <h3 style={{ fontSize: '1.1rem' }}>Privacy First</h3>
          <p style={{ fontSize: '0.85rem' }}>Your salary data is never uploaded or stored. Calculations run 100% in your browser.</p>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🔑</span>
          <h3 style={{ fontSize: '1.1rem' }}>No Login Needed</h3>
          <p style={{ fontSize: '0.85rem' }}>Start comparing immediately. We do not ask for email, OTP, or mobile numbers.</p>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>📅</span>
          <h3 style={{ fontSize: '1.1rem' }}>FY 2025–26 Rules</h3>
          <p style={{ fontSize: '0.85rem' }}>Updated with the latest budget rules, including standard deductions and slabs comparison.</p>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>⚡</span>
          <h3 style={{ fontSize: '1.1rem' }}>Instant Results</h3>
          <p style={{ fontSize: '0.85rem' }}>Answer a few basic questions and see dynamic estimations in real-time.</p>
        </div>
      </section>

      {/* Interactive Mock Preview Section */}
      <section className="preview-showcase card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        
        <div style={{ textAlign: 'left' }}>
          <span className="badge-fy" style={{ background: 'var(--accent-success-bg)', color: 'var(--accent-success)', border: 'none', marginBottom: '8px', display: 'inline-block' }}>
            Interactive Demo Preview
          </span>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Visual Dashboard Preview</h3>
          <p style={{ fontSize: '0.95rem' }}>
            Here is a sneak peek of the comparative analysis you will get when you finish.
          </p>
        </div>

        {/* Mock Comparison Cards & Mini-Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
          
          {/* Card 1: Results Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-input)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'var(--accent-success-bg)', color: 'var(--accent-success)', display: 'inline-flex', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', width: 'fit-content' }}>
              🎉 Recommend New Regime
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                ₹42,500
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Estimated Annual Tax Savings
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Monthly Extra Cash:</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹3,541 / mo</strong>
            </div>
          </div>

          {/* Card 2: Simple CSS Bar Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-input)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Regime Comparison</h4>
            
            {/* Chart Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Old Regime Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Old Regime Tax:</span>
                  <span style={{ fontWeight: '600' }}>₹1,25,000</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--text-secondary)', borderRadius: '9999px' }} />
                </div>
              </div>

              {/* New Regime Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>New Regime Tax:</span>
                  <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>₹82,500</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '66%', height: '100%', background: 'linear-gradient(90deg, var(--accent-primary) 0%, #a855f7 100%)', borderRadius: '9999px' }} />
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

    </div>
  );
}

export default LandingPage;
