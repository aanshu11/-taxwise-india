import { useTaxStore } from '../store/useTaxStore';
import { calculateTax } from '../utils/taxCalculator';

const formatIndianCurrency = (num) => {
  if (num === undefined || num === null || isNaN(Number(num))) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

function LivePreview() {
  const inputs = useTaxStore((state) => state.inputs);
  const results = calculateTax(inputs);

  const hasSalary = !!inputs.salary && !isNaN(Number(inputs.salary)) && Number(inputs.salary) >= 5000;

  if (!hasSalary) {
    return (
      <div className="preview-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'var(--text-muted)', textAlign: 'center' }}>
        <span style={{ fontSize: '2.5rem', opacity: 0.7 }}>📊</span>
        <h4 style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Live Estimator</h4>
        <p style={{ fontSize: '0.85rem', maxWidth: '200px' }}>Enter your salary in Step 1 to see live calculations here.</p>
      </div>
    );
  }

  const { oldTotalTax, newTotalTax, savings, recommendedRegime } = results;

  return (
    <div className="preview-sidebar animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>Live Tax Estimator</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updates in real-time as you type</p>
      </div>

      {/* Recommended Savings Pill */}
      {savings > 0 ? (
        <div style={{
          background: 'var(--accent-success-bg)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            💡 Recommended Regime
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent-success)' }}>
            {recommendedRegime === 'new' ? 'New Regime' : 'Old Regime'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Saves you <strong style={{ color: 'var(--accent-success)' }}>{formatIndianCurrency(savings)}/yr</strong>
          </span>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          padding: '12px',
          borderRadius: '12px',
          textAlign: 'left',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          💡 Both regimes result in equal tax (₹0 tax payable).
        </div>
      )}

      {/* Comparison Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Old Regime Summary Card */}
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'left',
          position: 'relative'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Old Regime Tax</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {formatIndianCurrency(oldTotalTax)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              / year
            </span>
          </div>
          {recommendedRegime === 'old' && savings > 0 && (
            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-success-bg)', color: 'var(--accent-success)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
              CHEAPER
            </span>
          )}
        </div>

        {/* New Regime Summary Card */}
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'left',
          position: 'relative'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>New Regime Tax</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {formatIndianCurrency(newTotalTax)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              / year
            </span>
          </div>
          {recommendedRegime === 'new' && savings > 0 && (
            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-success-bg)', color: 'var(--accent-success)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
              CHEAPER
            </span>
          )}
        </div>

      </div>

      {/* Quick Visual Slab Comparison Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'left' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Deductions Applied:</span>
        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Standard Deduction (Old):</span>
            <strong style={{ color: 'var(--text-secondary)' }}>₹50,000</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Standard Deduction (New):</span>
            <strong style={{ color: 'var(--text-secondary)' }}>₹75,000</strong>
          </div>
          {results.breakdown.pf > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Provident Fund (Est):</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{formatIndianCurrency(results.breakdown.pf)}</strong>
            </div>
          )}
          {results.breakdown.hraExemption > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>HRA Rent Exemption (Old):</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{formatIndianCurrency(results.breakdown.hraExemption)}</strong>
            </div>
          )}
          {results.breakdown.deductions80C > results.breakdown.pf && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Other 80C Deductions (Old):</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{formatIndianCurrency(results.breakdown.deductions80C - results.breakdown.pf)}</strong>
            </div>
          )}
          {results.breakdown.deductions80D > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Section 80D (Health):</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{formatIndianCurrency(results.breakdown.deductions80D)}</strong>
            </div>
          )}
          {results.breakdown.deductions24b > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Home Loan Interest (24b):</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{formatIndianCurrency(results.breakdown.deductions24b)}</strong>
            </div>
          )}
          {results.breakdown.deductionsNPS > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>NPS Deduction (80CCD):</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{formatIndianCurrency(results.breakdown.deductionsNPS)}</strong>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default LivePreview;
