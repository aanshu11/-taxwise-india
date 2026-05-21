import { useState } from 'react';
import { useTaxStore } from '../store/useTaxStore';

// Step names and questions mapping
const steps = [
  { id: 1, title: 'Monthly Salary', question: 'How much salary comes into your bank account every month?', optional: false },
  { id: 2, title: 'Age Group', question: 'What is your age group?', optional: false },
  { id: 3, title: 'Rent', question: 'Do you live in a rented house?', optional: true },
  { id: 4, title: 'PF Contribution', question: 'Does your company deduct PF from your salary?', optional: true },
  { id: 5, title: 'Tax-Saving Investments', question: 'Do you invest in tax-saving options like PPF, ELSS, or LIC?', optional: true },
  { id: 6, title: 'Health Insurance', question: 'Do you pay for health insurance?', optional: true },
  { id: 7, title: 'Home Loan', question: 'Do you have a home loan?', optional: true },
  { id: 8, title: 'NPS', question: 'Do you invest in NPS (National Pension System)?', optional: true },
];

// FAQ mapping per step
const stepFaqs = {
  1: [
    { q: 'What is monthly in-hand salary?', a: 'This is the actual net amount credited to your bank account each month by your employer, after standard company deductions like PF and Professional Tax.' },
    { q: 'Should I include bonuses or variable pay?', a: 'No, variable pay and yearly bonuses are best excluded here. We will reverse-calculate your basic gross salary based on your regular monthly income.' }
  ],
  2: [
    { q: 'Why does my age matter for tax?', a: 'Under the Old Tax Regime, basic tax-free exemption limits are higher for seniors (60-80 years: ₹3L) and super seniors (above 80 years: ₹5L) compared to individuals under 60 (₹2.5L).' }
  ],
  3: [
    { q: 'What is HRA exemption?', a: 'House Rent Allowance (HRA) is a tax deduction available under the Old Regime if you live in a rented house and pay rent.' },
    { q: 'Is rent benefit available in the New Regime?', a: 'No, rent deductions (HRA) are completely unavailable in the New Regime.' }
  ],
  4: [
    { q: 'What is Provident Fund (PF)?', a: 'PF is a retirement saving scheme. Your contribution is deducted from your salary and qualifies for tax deductions under Section 80C in the Old Regime.' },
    { q: 'Where do I find my PF deduction?', a: 'You can easily check your monthly PF deduction on your payslip.' }
  ],
  5: [
    { q: 'What falls under Section 80C?', a: 'Public Provident Fund (PPF), Equity Linked Savings Schemes (ELSS), Life Insurance premiums (LIC), National Savings Certificates (NSC), and Principal repayment of home loans.' },
    { q: 'What is the limit for Section 80C?', a: 'The maximum tax deduction allowed under Section 80C is ₹1,50,000 per year (Old Regime only).' }
  ],
  6: [
    { q: 'What is Section 80D?', a: 'Section 80D allows tax deductions for premiums paid towards health insurance policies for yourself, family, and parents.' },
    { q: 'How much deduction can I claim?', a: 'You can claim up to ₹25,000 yearly (₹50,000 if you or your parents are senior citizens) under the Old Regime.' }
  ],
  7: [
    { q: 'What is Section 24b?', a: 'It allows deductions on the interest paid towards a home loan for a self-occupied property.' },
    { q: 'What is the home loan interest limit?', a: 'You can deduct up to ₹2,00,000 of interest paid per year in the Old Regime.' }
  ],
  8: [
    { q: 'What is the NPS benefit under Section 80CCD(1B)?', a: 'NPS (National Pension System) allows an exclusive additional deduction of up to ₹50,000 yearly. This is over and above the ₹1.5 Lakh 80C limit.' }
  ]
};

// Formatting helpers
const formatIndianCurrency = (num) => {
  if (!num || isNaN(Number(num))) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

const formatLakhsWord = (num) => {
  if (!num || isNaN(Number(num))) return '';
  const annual = Number(num) * 12;
  if (annual >= 10000000) {
    return `~ ₹${(annual / 10000000).toFixed(2)} Crore / year`;
  }
  if (annual >= 100000) {
    return `~ ₹${(annual / 100000).toFixed(2)} Lakhs / year`;
  }
  return `~ ₹${annual.toLocaleString('en-IN')} / year`;
};

function Wizard() {
  const currentStep = useTaxStore((state) => state.currentStep);
  const setStep = useTaxStore((state) => state.setStep);
  const setView = useTaxStore((state) => state.setView);
  const inputs = useTaxStore((state) => state.inputs);
  const updateInput = useTaxStore((state) => state.updateInput);

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const activeStepInfo = steps[currentStep - 1];
  const activeFaqs = stepFaqs[currentStep] || [];

  // Validation functions
  const validateSalary = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 5000) return 'Monthly in-hand salary must be at least ₹5,00,000 check';
    if (num > 1000000) return 'Monthly in-hand salary cannot exceed ₹10,00,000';
    return '';
  };

  const validateRent = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 1000) return 'Monthly rent must be at least ₹1,000';
    if (num > 200000) return 'Monthly rent cannot exceed ₹2,00,000';
    return '';
  };

  const validatePF = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 500) return 'Monthly PF must be at least ₹500';
    if (num > 100000) return 'Monthly PF cannot exceed ₹1,00,000';
    return '';
  };

  const validate80C = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 1000) return 'Yearly investment must be at least ₹1,000';
    if (num > 500000) return 'Yearly investment cannot exceed ₹5,00,000';
    return '';
  };

  const validateHealth = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 1000) return 'Yearly premium must be at least ₹1,000';
    if (num > 100000) return 'Yearly premium cannot exceed ₹1,00,000';
    return '';
  };

  const validateHomeLoan = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 5000) return 'Yearly interest must be at least ₹5,000';
    if (num > 1000000) return 'Yearly interest cannot exceed ₹10,00,000';
    return '';
  };

  const validateNPS = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 1000) return 'Yearly NPS contribution must be at least ₹1,000';
    if (num > 200000) return 'Yearly NPS contribution cannot exceed ₹2,00,000';
    return '';
  };

  const salaryError = validateSalary(inputs.salary);
  const rentError = validateRent(inputs.monthlyRent);
  const pfError = validatePF(inputs.monthlyPF);
  const investments80CError = validate80C(inputs.investments80C);
  const healthError = validateHealth(inputs.healthInsurancePremium);
  const homeLoanError = validateHomeLoan(inputs.homeLoanInterest);
  const npsError = validateNPS(inputs.npsContribution);

  const isSalaryInvalid = !inputs.salary || salaryError !== '';
  const isRentInvalid = inputs.livesInRent === 'yes' && (!inputs.monthlyRent || rentError !== '');
  const isRentUnselected = inputs.livesInRent === null;
  const isPFInvalid = inputs.hasPF === 'yes' && (!inputs.monthlyPF || pfError !== '');
  const isPFUnselected = inputs.hasPF === null;
  const is80CInvalid = inputs.hasInvestments80C === 'yes' && (!inputs.investments80C || investments80CError !== '');
  const is80CUnselected = inputs.hasInvestments80C === null;
  const isHealthInvalid = inputs.hasHealthInsurance === 'yes' && (!inputs.healthInsurancePremium || healthError !== '');
  const isHealthUnselected = inputs.hasHealthInsurance === null;
  const isHomeLoanInvalid = inputs.hasHomeLoan === 'yes' && (!inputs.homeLoanInterest || homeLoanError !== '');
  const isHomeLoanUnselected = inputs.hasHomeLoan === null;
  const isNPSInvalid = inputs.hasNPS === 'yes' && (!inputs.npsContribution || npsError !== '');
  const isNPSUnselected = inputs.hasNPS === null;

  let isNextDisabled = false;
  if (currentStep === 1) {
    isNextDisabled = isSalaryInvalid;
  } else if (currentStep === 3) {
    isNextDisabled = isRentUnselected || isRentInvalid;
  } else if (currentStep === 4) {
    isNextDisabled = isPFUnselected || isPFInvalid;
  } else if (currentStep === 5) {
    isNextDisabled = is80CUnselected || is80CInvalid;
  } else if (currentStep === 6) {
    isNextDisabled = isHealthUnselected || isHealthInvalid;
  } else if (currentStep === 7) {
    isNextDisabled = isHomeLoanUnselected || isHomeLoanInvalid;
  } else if (currentStep === 8) {
    isNextDisabled = isNPSUnselected || isNPSInvalid;
  }

  // Linear progression navigation locks for clicking step dots
  const isStep1Valid = !isSalaryInvalid;
  const isStep3Valid = inputs.livesInRent === 'no' || (inputs.livesInRent === 'yes' && !isRentInvalid);
  const isStep4Valid = inputs.hasPF === 'no' || inputs.hasPF === 'not_sure' || (inputs.hasPF === 'yes' && !isPFInvalid);
  const isStep5Valid = inputs.hasInvestments80C === 'no' || (inputs.hasInvestments80C === 'yes' && !is80CInvalid);
  const isStep6Valid = inputs.hasHealthInsurance === 'no' || (inputs.hasHealthInsurance === 'yes' && !isHealthInvalid);
  const isStep7Valid = inputs.hasHomeLoan === 'no' || (inputs.hasHomeLoan === 'yes' && !isHomeLoanInvalid);

  const getStepClickable = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return isStep1Valid;
    if (stepId === 3) return isStep1Valid;
    if (stepId === 4) return isStep1Valid && isStep3Valid;
    if (stepId === 5) return isStep1Valid && isStep3Valid && isStep4Valid;
    if (stepId === 6) return isStep1Valid && isStep3Valid && isStep4Valid && isStep5Valid;
    if (stepId === 7) return isStep1Valid && isStep3Valid && isStep4Valid && isStep5Valid && isStep6Valid;
    if (stepId === 8) return isStep1Valid && isStep3Valid && isStep4Valid && isStep5Valid && isStep6Valid && isStep7Valid;
    return false;
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    if (currentStep < 8) {
      setStep(currentStep + 1);
      setOpenFaqIndex(null);
    } else {
      setView('results');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
      setOpenFaqIndex(null);
    } else {
      setView('landing');
    }
  };

  const handleSkip = () => {
    if (currentStep === 3) {
      updateInput('livesInRent', 'no');
      updateInput('monthlyRent', '');
    } else if (currentStep === 4) {
      updateInput('hasPF', 'no');
      updateInput('monthlyPF', '');
    } else if (currentStep === 5) {
      updateInput('hasInvestments80C', 'no');
      updateInput('investments80C', '');
    } else if (currentStep === 6) {
      updateInput('hasHealthInsurance', 'no');
      updateInput('healthInsurancePremium', '');
    } else if (currentStep === 7) {
      updateInput('hasHomeLoan', 'no');
      updateInput('homeLoanInterest', '');
    } else if (currentStep === 8) {
      updateInput('hasNPS', 'no');
      updateInput('npsContribution', '');
    }
    handleNext();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isNextDisabled) {
      handleNext();
    }
  };

  const progressPercent = Math.round(((currentStep - 1) / steps.length) * 100);

  // Overriding salary minimum error text display helper to avoid confusing the user
  const renderSalaryErrorText = salaryError === 'Monthly in-hand salary must be at least ₹5,000' 
    ? 'Monthly in-hand salary must be at least ₹5,000' 
    : salaryError;

  return (
    <div className="wizard-card animate-fade-in" onKeyDown={handleKeyPress}>
      {/* Step Header & Progress Indicators */}
      <div className="wizard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Step {currentStep} of {steps.length} — {activeStepInfo.title}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            {progressPercent}% Complete
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent-primary) 0%, #a855f7 100%)', 
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            }} 
          />
        </div>

        {/* Step Dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
          {steps.map((step) => {
            const isClickable = getStepClickable(step.id);
            return (
              <div 
                key={step.id} 
                onClick={() => isClickable && setStep(step.id)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: step.id === currentStep 
                    ? 'var(--accent-primary)' 
                    : step.id < currentStep 
                      ? 'rgba(var(--accent-primary-rgb), 0.4)' 
                      : 'var(--border-color)',
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  opacity: isClickable ? 1 : 0.4,
                  transition: 'var(--transition-fast)'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Section */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.6rem', textAlign: 'left', fontWeight: '700' }}>
          {activeStepInfo.question}
        </h2>

        {/* Step 1: Salary Input */}
        {currentStep === 1 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label" htmlFor="salary-input">Monthly Net In-hand Salary</label>
            <div className="input-container">
              <span className="input-prefix">₹</span>
              <input
                id="salary-input"
                className="input-field"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 75000"
                value={inputs.salary}
                onChange={(e) => updateInput('salary', e.target.value)}
                autoFocus
              />
            </div>
            {inputs.salary && !salaryError && (
              <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                {formatIndianCurrency(inputs.salary)} per month &nbsp;
                <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                  {formatLakhsWord(inputs.salary)}
                </span>
              </div>
            )}
            {salaryError && (
              <div className="error-message">{renderSalaryErrorText}</div>
            )}
            {!inputs.salary && (
              <div className="input-helper" style={{ marginTop: '8px' }}>
                Enter the monthly amount credited to your account (Minimum ₹5,000).
              </div>
            )}
          </div>
        )}

        {/* Step 2: Age Group Cards */}
        {currentStep === 2 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Select Age Category</label>
            <div className="options-grid">
              
              <div 
                className={`option-card ${inputs.ageGroup === 'under60' ? 'selected' : ''}`}
                onClick={() => updateInput('ageGroup', 'under60')}
              >
                <span style={{ fontSize: '1.5rem' }}>🧑</span>
                <span className="option-title">Under 60 Years</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard exemption limit applies</p>
              </div>

              <div 
                className={`option-card ${inputs.ageGroup === '60to80' ? 'selected' : ''}`}
                onClick={() => updateInput('ageGroup', '60to80')}
              >
                <span style={{ fontSize: '1.5rem' }}>🧓</span>
                <span className="option-title">Senior (60 to 80)</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Higher tax exemptions apply (Old Regime)</p>
              </div>

              <div 
                className={`option-card ${inputs.ageGroup === 'above80' ? 'selected' : ''}`}
                onClick={() => updateInput('ageGroup', 'above80')}
              >
                <span style={{ fontSize: '1.5rem' }}>👵</span>
                <span className="option-title">Super Senior (80+)</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highest tax exemptions apply (Old Regime)</p>
              </div>

            </div>
          </div>
        )}

        {/* Step 3: Rent details */}
        {currentStep === 3 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Do you pay rent for your accommodation?</label>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
              <div 
                className={`option-card ${inputs.livesInRent === 'yes' ? 'selected' : ''}`}
                onClick={() => updateInput('livesInRent', 'yes')}
              >
                <span style={{ fontSize: '1.5rem' }}>🏠</span>
                <span className="option-title">Yes, I rent</span>
              </div>
              <div 
                className={`option-card ${inputs.livesInRent === 'no' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('livesInRent', 'no');
                  updateInput('monthlyRent', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                <span className="option-title">No, self-owned or other</span>
              </div>
            </div>

            {inputs.livesInRent === 'yes' && (
              <div className="form-group animate-fade-in" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="rent-input">Monthly Rent Paid</label>
                <div className="input-container">
                  <span className="input-prefix">₹</span>
                  <input
                    id="rent-input"
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 15000"
                    value={inputs.monthlyRent}
                    onChange={(e) => updateInput('monthlyRent', e.target.value)}
                    autoFocus
                  />
                </div>
                {inputs.monthlyRent && !rentError && (
                  <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatIndianCurrency(inputs.monthlyRent)} per month &nbsp;
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                      ~ {formatIndianCurrency(inputs.monthlyRent * 12)} / year
                    </span>
                  </div>
                )}
                {rentError && (
                  <div className="error-message">{rentError}</div>
                )}
                {!inputs.monthlyRent && (
                  <div className="input-helper" style={{ marginTop: '8px' }}>
                    Enter the monthly rent paid by you (Minimum ₹1,000).
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: PF Contribution */}
        {currentStep === 4 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Does your company deduct Provident Fund (PF) from your salary?</label>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '24px' }}>
              <div 
                className={`option-card ${inputs.hasPF === 'yes' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasPF', 'yes');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💼</span>
                <span className="option-title">Yes, standard PF</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enter monthly deduction</p>
              </div>
              <div 
                className={`option-card ${inputs.hasPF === 'no' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasPF', 'no');
                  updateInput('monthlyPF', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>❌</span>
                <span className="option-title">No PF</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No salary deductions</p>
              </div>
              <div 
                className={`option-card ${inputs.hasPF === 'not_sure' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasPF', 'not_sure');
                  updateInput('monthlyPF', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>❓</span>
                <span className="option-title">Not Sure</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimate at 12% basic</p>
              </div>
            </div>

            {inputs.hasPF === 'yes' && (
              <div className="form-group animate-fade-in" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="pf-input">Monthly PF Deduction amount (from payslip)</label>
                <div className="input-container">
                  <span className="input-prefix">₹</span>
                  <input
                    id="pf-input"
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 5000"
                    value={inputs.monthlyPF}
                    onChange={(e) => updateInput('monthlyPF', e.target.value)}
                    autoFocus
                  />
                </div>
                {inputs.monthlyPF && !pfError && (
                  <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatIndianCurrency(inputs.monthlyPF)} per month &nbsp;
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                      ~ {formatIndianCurrency(inputs.monthlyPF * 12)} / year (qualifies for Sec 80C)
                    </span>
                  </div>
                )}
                {pfError && (
                  <div className="error-message">{pfError}</div>
                )}
                {!inputs.monthlyPF && (
                  <div className="input-helper" style={{ marginTop: '8px' }}>
                    Enter the monthly amount shown on your salary slip (Minimum ₹500).
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Section 80C Investments */}
        {currentStep === 5 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Do you invest in tax-saving options like PPF, ELSS (Mutual Funds), or LIC premiums?</label>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
              <div 
                className={`option-card ${inputs.hasInvestments80C === 'yes' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasInvestments80C', 'yes');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <span className="option-title">Yes, I invest</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Specify annual amount</p>
              </div>
              <div 
                className={`option-card ${inputs.hasInvestments80C === 'no' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasInvestments80C', 'no');
                  updateInput('investments80C', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                <span className="option-title">No investments</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No other tax-saving funds</p>
              </div>
            </div>

            {inputs.hasInvestments80C === 'yes' && (
              <div className="form-group animate-fade-in" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="investments-80c-input">Total Yearly 80C Investments (Excluding PF)</label>
                <div className="input-container">
                  <span className="input-prefix">₹</span>
                  <input
                    id="investments-80c-input"
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 100000"
                    value={inputs.investments80C}
                    onChange={(e) => updateInput('investments80C', e.target.value)}
                    autoFocus
                  />
                </div>
                {inputs.investments80C && !investments80CError && (
                  <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatIndianCurrency(inputs.investments80C)} per year &nbsp;
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                      (Total 80C cap is ₹1,50,000, including PF)
                    </span>
                  </div>
                )}
                {investments80CError && (
                  <div className="error-message">{investments80CError}</div>
                )}
                {!inputs.investments80C && (
                  <div className="input-helper" style={{ marginTop: '8px' }}>
                    Enter total yearly amount invested. Qualified limit is capped at ₹1,50,000.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Health Insurance */}
        {currentStep === 6 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Do you pay health insurance premiums for yourself, your family, or parents?</label>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
              <div 
                className={`option-card ${inputs.hasHealthInsurance === 'yes' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasHealthInsurance', 'yes');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🏥</span>
                <span className="option-title">Yes, I pay premiums</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qualifies under Section 80D</p>
              </div>
              <div 
                className={`option-card ${inputs.hasHealthInsurance === 'no' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasHealthInsurance', 'no');
                  updateInput('healthInsurancePremium', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                <span className="option-title">No health premium</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No premium expenses</p>
              </div>
            </div>

            {inputs.hasHealthInsurance === 'yes' && (
              <div className="form-group animate-fade-in" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="health-input">Total Yearly Health Premium Paid</label>
                <div className="input-container">
                  <span className="input-prefix">₹</span>
                  <input
                    id="health-input"
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 15000"
                    value={inputs.healthInsurancePremium}
                    onChange={(e) => updateInput('healthInsurancePremium', e.target.value)}
                    autoFocus
                  />
                </div>
                {inputs.healthInsurancePremium && !healthError && (
                  <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatIndianCurrency(inputs.healthInsurancePremium)} per year &nbsp;
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                      (Maximum limit is {inputs.ageGroup === 'under60' ? '₹25,000' : '₹50,000 (Senior Citizen cap)'})
                    </span>
                  </div>
                )}
                {healthError && (
                  <div className="error-message">{healthError}</div>
                )}
                {!inputs.healthInsurancePremium && (
                  <div className="input-helper" style={{ marginTop: '8px' }}>
                    Enter total yearly health insurance premium paid (Minimum ₹1,000).
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 7: Home Loan */}
        {currentStep === 7 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Do you pay interest on a home loan for a self-occupied property?</label>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
              <div 
                className={`option-card ${inputs.hasHomeLoan === 'yes' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasHomeLoan', 'yes');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🏠</span>
                <span className="option-title">Yes, home loan interest</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qualifies under Section 24b</p>
              </div>
              <div 
                className={`option-card ${inputs.hasHomeLoan === 'no' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasHomeLoan', 'no');
                  updateInput('homeLoanInterest', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                <span className="option-title">No home loan</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No home loan liability</p>
              </div>
            </div>

            {inputs.hasHomeLoan === 'yes' && (
              <div className="form-group animate-fade-in" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="homeloan-input">Total Yearly Home Loan Interest Paid</label>
                <div className="input-container">
                  <span className="input-prefix">₹</span>
                  <input
                    id="homeloan-input"
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 150000"
                    value={inputs.homeLoanInterest}
                    onChange={(e) => updateInput('homeLoanInterest', e.target.value)}
                    autoFocus
                  />
                </div>
                {inputs.homeLoanInterest && !homeLoanError && (
                  <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatIndianCurrency(inputs.homeLoanInterest)} per year &nbsp;
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                      (Maximum deduction limit is ₹2,00,000 under Old Regime)
                    </span>
                  </div>
                )}
                {homeLoanError && (
                  <div className="error-message">{homeLoanError}</div>
                )}
                {!inputs.homeLoanInterest && (
                  <div className="input-helper" style={{ marginTop: '8px' }}>
                    Enter the total yearly interest portion paid on the loan (Minimum ₹5,000).
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 8: NPS */}
        {currentStep === 8 && (
          <div className="form-group animate-fade-in" style={{ margin: '16px 0' }}>
            <label className="form-label">Do you invest in the National Pension System (NPS)?</label>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
              <div 
                className={`option-card ${inputs.hasNPS === 'yes' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasNPS', 'yes');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>📈</span>
                <span className="option-title">Yes, I invest in NPS</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Additional 50k under Sec 80CCD(1B)</p>
              </div>
              <div 
                className={`option-card ${inputs.hasNPS === 'no' ? 'selected' : ''}`}
                onClick={() => {
                  updateInput('hasNPS', 'no');
                  updateInput('npsContribution', '');
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <span className="option-title">No NPS</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No NPS investment</p>
              </div>
            </div>

            {inputs.hasNPS === 'yes' && (
              <div className="form-group animate-fade-in" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="nps-input">Total Yearly NPS Contribution</label>
                <div className="input-container">
                  <span className="input-prefix">₹</span>
                  <input
                    id="nps-input"
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 50000"
                    value={inputs.npsContribution}
                    onChange={(e) => updateInput('npsContribution', e.target.value)}
                    autoFocus
                  />
                </div>
                {inputs.npsContribution && !npsError && (
                  <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatIndianCurrency(inputs.npsContribution)} per year &nbsp;
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                      (Maximum additional deduction is ₹50,000)
                    </span>
                  </div>
                )}
                {npsError && (
                  <div className="error-message">{npsError}</div>
                )}
                {!inputs.npsContribution && (
                  <div className="input-helper" style={{ marginTop: '8px' }}>
                    Enter total yearly self contribution to NPS Tier-1 account (Minimum ₹1,000).
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion FAQ Section */}
      {activeFaqs.length > 0 && (
        <div className="faq-accordion">
          <div className="faq-title">💡 FAQ about this step</div>
          {activeFaqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-header" 
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              >
                <span>{faq.q}</span>
                <span>{openFaqIndex === index ? '▲' : '▼'}</span>
              </div>
              {openFaqIndex === index && (
                <div className="faq-content animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Navigation Actions Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '32px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)' 
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={handleBack}
        >
          &larr; Back
        </button>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {activeStepInfo.optional && (
            <button 
              className="btn btn-secondary" 
              onClick={handleSkip}
            >
              Skip
            </button>
          )}
          <button 
            className={`btn btn-primary ${isNextDisabled ? 'btn-disabled' : ''}`}
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            {currentStep === 8 ? 'See Comparison' : 'Next'} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wizard;
