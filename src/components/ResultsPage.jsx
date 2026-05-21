import { useState, useMemo } from 'react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax } from '../utils/taxCalculator';

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '₹0';
  return '₹' + Math.round(Number(num)).toLocaleString('en-IN');
};

const fmtPct = (num, total) => {
  if (!total) return '0%';
  return ((num / total) * 100).toFixed(1) + '%';
};

// ── Sub-components ───────────────────────────────────────────────────────────

function HeroCard({ regime, totalTax, cess, baseTax, rebate, recommended, savings, annualIncome }) {
  const isNew = regime === 'new';
  const effectiveRate = annualIncome > 0 ? ((totalTax / annualIncome) * 100).toFixed(1) : '0.0';

  return (
    <div style={{
      background: recommended
        ? 'linear-gradient(135deg, hsl(142, 72%, 28%) 0%, hsl(160, 65%, 32%) 100%)'
        : 'var(--bg-input)',
      border: recommended ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      flex: '1 1 0',
      minWidth: '0',
      transition: 'all 0.3s ease',
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          background: 'hsl(142, 72%, 28%)', color: '#fff', fontSize: '0.7rem', fontWeight: '800',
          padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.06em', whiteSpace: 'nowrap',
          boxShadow: '0 2px 12px rgba(16,185,129,0.35)',
        }}>
          ✓ RECOMMENDED — SAVES {fmt(savings)}/yr
        </div>
      )}
      <div style={{ color: recommended ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {isNew ? 'New Tax Regime' : 'Old Tax Regime'}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '2.4rem', fontWeight: '800', color: recommended ? '#fff' : 'var(--text-primary)', lineHeight: 1 }}>{fmt(totalTax)}</span>
        <span style={{ fontSize: '0.85rem', color: recommended ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>/ year</span>
      </div>
      <div style={{ fontSize: '0.82rem', color: recommended ? 'rgba(255,255,255,0.65)' : 'var(--text-secondary)', marginBottom: '16px' }}>
        Effective rate: <strong style={{ color: recommended ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)' }}>{effectiveRate}%</strong>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: `1px solid ${recommended ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'}`, paddingTop: '14px' }}>
        {[
          { label: 'Base Tax', value: baseTax },
          ...(rebate > 0 ? [{ label: 'Sec 87A Rebate', value: -rebate, positive: false }] : []),
          { label: '4% Edu. Cess', value: cess },
        ].map(({ label, value, positive }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: recommended ? 'rgba(255,255,255,0.65)' : 'var(--text-secondary)' }}>{label}</span>
            <strong style={{ color: positive === false ? (recommended ? '#86efac' : 'var(--accent-success)') : (recommended ? '#fff' : 'var(--text-primary)') }}>
              {positive === false ? '−' : ''}{fmt(Math.abs(value))}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlabBar({ label, amount, percent, color }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{fmt(amount)} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({percent})</span></span>
      </div>
      <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: percent, background: color, borderRadius: '9999px', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

function DeductionRow({ label, oldVal, newVal }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td style={{ padding: '10px 8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</td>
      <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.82rem', fontWeight: '600', color: oldVal > 0 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
        {oldVal > 0 ? `−${fmt(oldVal)}` : '—'}
      </td>
      <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.82rem', fontWeight: '600', color: newVal > 0 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
        {newVal > 0 ? `−${fmt(newVal)}` : '—'}
      </td>
    </tr>
  );
}

// ── Optimization Meter ───────────────────────────────────────────────────────

function OptimizationMeter({ score, sublabel }) {
  // Arc from -150° to -30° (240° sweep)
  const r = 54;
  const cx = 70, cy = 70;
  const sweep = 240;
  const startAngle = 150; // degrees, measuring clockwise from positive x-axis
  const endAngle = startAngle + sweep;
  const toRad = (d) => (d * Math.PI) / 180;

  const arcX = (angle) => cx + r * Math.cos(toRad(angle));
  const arcY = (angle) => cy + r * Math.sin(toRad(angle));

  const bgStart = { x: arcX(startAngle), y: arcY(startAngle) };
  const bgEnd = { x: arcX(endAngle), y: arcY(endAngle) };
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  const fgAngle = startAngle + (sweep * score) / 100;
  const fgEnd = { x: arcX(fgAngle), y: arcY(fgAngle) };
  const largeArc = (sweep * score) / 100 > 180 ? 1 : 0;
  const fgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fgEnd.x} ${fgEnd.y}`;

  const color = score >= 80 ? 'hsl(142, 70%, 42%)' : score >= 50 ? 'hsl(38, 92%, 50%)' : 'hsl(350, 80%, 55%)';
  const label2 = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Room to Optimize';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width="140" height="90" viewBox="0 0 140 90">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="var(--border-color)" strokeWidth="10" strokeLinecap="round" />
        {/* Foreground arc */}
        {score > 0 && (
          <path d={fgPath} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            style={{ transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
        )}
        {/* Score text */}
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text-primary)">{Math.round(score)}%</text>
      </svg>
      <div style={{ fontSize: '0.75rem', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label2}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '140px' }}>{sublabel}</div>
    </div>
  );
}

// ── What-If Slider Row ────────────────────────────────────────────────────────

function SliderRow({ label, icon, value, min, max, step, onChange, currentSaving, unitLabel = '/ year', helpText }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{fmt(value)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>{unitLabel}</span>
        </div>
      </div>
      <div style={{ position: 'relative', marginBottom: '6px' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{helpText}</span>
        {currentSaving !== null && currentSaving !== undefined && (
          <span style={{
            fontSize: '0.72rem', fontWeight: '700',
            color: currentSaving > 0 ? 'var(--accent-success)' : 'var(--text-muted)',
            background: currentSaving > 0 ? 'var(--accent-success-bg)' : 'transparent',
            padding: currentSaving > 0 ? '2px 8px' : '0',
            borderRadius: '999px'
          }}>
            {currentSaving > 0 ? `Saves ${fmt(currentSaving)} extra` : 'No additional saving'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

function ResultsPage() {
  const inputs = useTaxStore((state) => state.inputs);
  const setView = useTaxStore((state) => state.setView);
  const setStep = useTaxStore((state) => state.setStep);
  const resetStore = useTaxStore((state) => state.resetStore);

  // ── Actual results from wizard inputs ───────────────────────────────────
  const results = calculateTax(inputs);
  const {
    grossSalary, newTaxableIncome, oldTaxableIncome,
    newBaseTax, oldBaseTax, newRebate, oldRebate,
    newCess, oldCess, newTotalTax, oldTotalTax, savings,
    recommendedRegime, breakdown,
  } = results;

  // ── What-If slider local state (separate from store) ────────────────────
  const basePfAnnual = breakdown.pf || 0;

  const [wi80C, setWi80C] = useState(Number(inputs.investments80C) || 0);
  const [wiNPS, setWiNPS] = useState(Number(inputs.npsContribution) || 0);
  const [wiHealth, setWiHealth] = useState(Number(inputs.healthInsurancePremium) || 0);
  const [wiHomeLoan, setWiHomeLoan] = useState(Number(inputs.homeLoanInterest) || 0);

  // Build what-if inputs merged with slider values
  const whatIfInputs = useMemo(() => ({
    ...inputs,
    investments80C: String(wi80C),
    npsContribution: String(wiNPS),
    healthInsurancePremium: String(wiHealth),
    homeLoanInterest: String(wiHomeLoan),
  }), [inputs, wi80C, wiNPS, wiHealth, wiHomeLoan]);

  const wiResults = calculateTax(whatIfInputs);
  const wiOldTax = wiResults.oldTotalTax;
  const wiNewTax = wiResults.newTotalTax;
  const wiBestTax = Math.min(wiOldTax, wiNewTax);
  const currentBestTax = Math.min(oldTotalTax, newTotalTax);
  const wiExtraSaving = Math.max(0, currentBestTax - wiBestTax);

  // ── Optimization score ───────────────────────────────────────────────────
  const ageGroup = inputs.ageGroup || 'under60';
  const healthCap = (ageGroup === '60to80' || ageGroup === 'above80') ? 50000 : 25000;
  const actualOldDeductionsExtra =
    breakdown.deductions80C +
    breakdown.deductions80D +
    breakdown.deductions24b +
    breakdown.deductionsNPS +
    breakdown.hraExemption;
  const maxExtra = 150000 + healthCap + 200000 + 50000;
  const optScore = maxExtra > 0 ? Math.min(100, (actualOldDeductionsExtra / maxExtra) * 100) : 0;

  // ── Slab breakdowns ──────────────────────────────────────────────────────
  const oldSlabs = (() => {
    const ti = oldTaxableIncome;
    if (ti <= 0) return [];
    const exemptLimit = ageGroup === 'above80' ? 500000 : ageGroup === '60to80' ? 300000 : 250000;
    const slabs = [];
    if (ti > exemptLimit) slabs.push({ label: `${fmt(exemptLimit)} – ₹5,00,000 (5%)`, amount: Math.min(ti, 500000) - exemptLimit, rate: 0.05 });
    if (ti > 500000) slabs.push({ label: '₹5,00,000 – ₹10,00,000 (20%)', amount: Math.min(ti, 1000000) - 500000, rate: 0.20 });
    if (ti > 1000000) slabs.push({ label: 'Above ₹10,00,000 (30%)', amount: ti - 1000000, rate: 0.30 });
    return slabs.filter(s => s.amount > 0);
  })();

  const newSlabs = (() => {
    const ti = newTaxableIncome;
    if (ti <= 0) return [];
    const slabs = [];
    if (ti > 400000) slabs.push({ label: '₹4,00,000 – ₹8,00,000 (5%)', amount: Math.min(ti, 800000) - 400000, rate: 0.05 });
    if (ti > 800000) slabs.push({ label: '₹8,00,000 – ₹12,00,000 (10%)', amount: Math.min(ti, 1200000) - 800000, rate: 0.10 });
    if (ti > 1200000) slabs.push({ label: '₹12,00,000 – ₹16,00,000 (15%)', amount: Math.min(ti, 1600000) - 1200000, rate: 0.15 });
    if (ti > 1600000) slabs.push({ label: '₹16,00,000 – ₹20,00,000 (20%)', amount: Math.min(ti, 2000000) - 1600000, rate: 0.20 });
    if (ti > 2000000) slabs.push({ label: 'Above ₹20,00,000 (30%)', amount: ti - 2000000, rate: 0.30 });
    return slabs.filter(s => s.amount > 0);
  })();

  const maxSlabBase = Math.max(oldBaseTax, newBaseTax, 1);
  const barColors = ['hsl(217,91%,60%)', 'hsl(224,85%,55%)', 'hsl(250,80%,58%)', 'hsl(262,83%,58%)', 'hsl(280,75%,55%)'];

  const handleEditAnswers = () => { setStep(1); setView('wizard'); };
  const handleStartOver = () => { resetStore(); };

  return (
    <div className="results-page animate-fade-in">

      {/* ─ Page Title ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '6px 16px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          📊 FY 2025–26 Tax Regime Comparison
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Your Tax Comparison Results</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Estimated gross income: <strong style={{ color: 'var(--text-primary)' }}>{fmt(grossSalary)} / year</strong>
          {' '}· Monthly in-hand: <strong style={{ color: 'var(--text-primary)' }}>{fmt(Number(inputs.salary))}</strong>
        </p>
      </div>

      {/* ─ Hero Comparison Cards ─────────────────────────────────────── */}
      <div className="results-hero-row" style={{ display: 'flex', gap: '20px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <HeroCard regime="old" totalTax={oldTotalTax} baseTax={oldBaseTax} rebate={oldRebate} cess={oldCess} recommended={recommendedRegime === 'old'} savings={savings} annualIncome={grossSalary} />
        <HeroCard regime="new" totalTax={newTotalTax} baseTax={newBaseTax} rebate={newRebate} cess={newCess} recommended={recommendedRegime === 'new'} savings={savings} annualIncome={grossSalary} />
      </div>

      {/* ─ Recommendation Banner ─────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, hsl(224, 85%, 57%) 0%, hsl(250, 80%, 58%) 100%)', borderRadius: '14px', padding: '20px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>💡 Our Recommendation</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Choose the <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.5)' }}>{recommendedRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
          </div>
          <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
            {savings > 0 ? `You save ${fmt(savings)} per year (${fmt(Math.round(savings / 12))}/month)` : 'Both regimes result in the same tax for your income'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{fmt(Math.min(oldTotalTax, newTotalTax))}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Minimum tax payable / year</div>
        </div>
      </div>

      {/* ─ Details: Deductions + Slab Charts ────────────────────────── */}
      <div className="results-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>

        {/* Deductions Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧾</span>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Deductions Applied</span>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Deduction</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Old</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>New</th>
                </tr>
              </thead>
              <tbody>
                <DeductionRow label="Standard Deduction" oldVal={breakdown.standardDeduction.old} newVal={breakdown.standardDeduction.new} />
                <DeductionRow label="Professional Tax" oldVal={breakdown.pt} newVal={0} />
                {breakdown.hraExemption > 0 && <DeductionRow label="HRA Rent Exemption" oldVal={breakdown.hraExemption} newVal={0} />}
                {breakdown.deductions80C > 0 && <DeductionRow label="Section 80C (PF + Investments)" oldVal={breakdown.deductions80C} newVal={0} />}
                {breakdown.deductions80D > 0 && <DeductionRow label="Section 80D (Health)" oldVal={breakdown.deductions80D} newVal={0} />}
                {breakdown.deductions24b > 0 && <DeductionRow label="Section 24b (Home Loan)" oldVal={breakdown.deductions24b} newVal={0} />}
                {breakdown.deductionsNPS > 0 && <DeductionRow label="Section 80CCD (NPS)" oldVal={breakdown.deductionsNPS} newVal={0} />}
                <tr style={{ background: 'var(--bg-input)', borderTop: '2px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 8px', fontSize: '0.82rem', fontWeight: '700' }}>Taxable Income</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{fmt(oldTaxableIncome)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{fmt(newTaxableIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Slab Breakdown */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Tax Slab Breakdown</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Old Regime</div>
              {oldSlabs.length > 0 ? oldSlabs.map((s, i) => (
                <SlabBar key={i} label={s.label} amount={s.amount * s.rate} percent={fmtPct(s.amount * s.rate, maxSlabBase)} color={barColors[i % barColors.length]} />
              )) : <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>₹0 — fully exempt or rebated</p>}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>New Regime</div>
              {newSlabs.length > 0 ? newSlabs.map((s, i) => (
                <SlabBar key={i} label={s.label} amount={s.amount * s.rate} percent={fmtPct(s.amount * s.rate, maxSlabBase)} color={`hsl(${160 + i * 25}, 65%, 40%)`} />
              )) : <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>₹0 — fully exempt or rebated</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ─ Quick Summary Metrics ─────────────────────────────────────── */}
      <div className="results-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Monthly Tax Saved', value: fmt(Math.round(savings / 12)), icon: '💸', desc: 'by choosing recommended regime' },
          { label: 'Estimated Annual Gross', value: fmt(grossSalary), icon: '💼', desc: 'reverse-calculated from in-hand' },
          { label: 'Total Deductions (Old)', value: fmt(breakdown.hraExemption + breakdown.deductions80C + breakdown.deductions80D + breakdown.deductions24b + breakdown.deductionsNPS), icon: '🛡️', desc: 'over and above standard deduction' },
        ].map(({ label, value, icon, desc }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{icon}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ─ Optimization Meter + What-If Sliders ─────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
        {/* Section header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎛️</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>Tax Optimization & What-If Planner</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drag the sliders to explore how additional investments reduce your tax</div>
          </div>
        </div>

        <div className="whatif-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '0' }}>

          {/* Optimization Meter Panel */}
          <div className="whatif-meter-panel" style={{ padding: '24px 20px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--bg-input)' }}>
            <OptimizationMeter
              score={optScore}
              sublabel="of available Old Regime deductions claimed"
            />
            {wiExtraSaving > 0 && (
              <div style={{
                background: 'var(--accent-success-bg)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '10px',
                padding: '10px 14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What-If Saving</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-success)' }}>{fmt(wiExtraSaving)}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>extra savings / year</div>
              </div>
            )}
          </div>

          {/* Sliders Panel */}
          <div style={{ padding: '24px 28px' }}>
            <SliderRow
              label="Section 80C Investments (excl. PF)"
              icon="💰"
              value={wi80C}
              min={0}
              max={150000}
              step={1000}
              onChange={setWi80C}
              currentSaving={wiExtraSaving > 0 ? undefined : null}
              unitLabel="/ year"
              helpText={`Max ₹1,50,000 total (incl. PF of ${fmt(basePfAnnual)})`}
            />
            <SliderRow
              label="NPS Contribution (Sec 80CCD 1B)"
              icon="📈"
              value={wiNPS}
              min={0}
              max={50000}
              step={1000}
              onChange={setWiNPS}
              currentSaving={null}
              unitLabel="/ year"
              helpText="Exclusive extra deduction up to ₹50,000"
            />
            <SliderRow
              label="Health Insurance Premium (Sec 80D)"
              icon="🏥"
              value={wiHealth}
              min={0}
              max={healthCap}
              step={1000}
              onChange={setWiHealth}
              currentSaving={null}
              unitLabel="/ year"
              helpText={`Max ₹${(healthCap / 1000).toFixed(0)},000 for your age group`}
            />
            <SliderRow
              label="Home Loan Interest (Sec 24b)"
              icon="🏠"
              value={wiHomeLoan}
              min={0}
              max={200000}
              step={5000}
              onChange={setWiHomeLoan}
              currentSaving={null}
              unitLabel="/ year"
              helpText="Max ₹2,00,000 deduction for self-occupied property"
            />

            {/* What-If tax result summary */}
            <div style={{ marginTop: '8px', padding: '14px 18px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>What-If Best Tax</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{fmt(wiBestTax)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>/year</span></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>vs Current Best</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{fmt(currentBestTax)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: wiExtraSaving > 0 ? 'var(--accent-success)' : 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Extra Saving</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: wiExtraSaving > 0 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                  {wiExtraSaving > 0 ? `+${fmt(wiExtraSaving)}` : 'No change'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─ Disclaimer ────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--accent-warning-bg)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--accent-warning)', display: 'block', marginBottom: '6px' }}>⚠️ Important Disclaimer</strong>
        These calculations are estimates for FY 2025–26 based on standard salaried assumptions (Basic = 50% of Gross, non-metro HRA).
        Actual tax liability may vary based on exact salary structure, surcharges above ₹50L income, employer PF contributions,
        and other personal financial factors. Please consult a qualified CA for precise tax planning.
      </div>

      {/* ─ Action Buttons ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={handleEditAnswers}>✏️ Edit My Answers</button>
        <button className="btn btn-primary" onClick={handleStartOver}>🔄 Start Fresh Calculation</button>
      </div>

    </div>
  );
}

export default ResultsPage;
