// Core Tax Calculator Utility for FY 2025–26 (New vs Old regimes)

export const calculateTax = (inputs) => {
  const monthlySalary = Number(inputs.salary) || 0;
  const hasPF = inputs.hasPF === 'yes' || inputs.hasPF === 'not_sure'; // If not sure, we will estimate
  const ageGroup = inputs.ageGroup || 'under60';
  
  // 1. Gross Salary Reverse Calculation
  // Professional Tax is flat ₹2,500 per year for salaried employees (where monthly in-hand > 0)
  const annualInHand = monthlySalary * 12;
  const pt = annualInHand > 0 ? 2500 : 0;
  
  let grossSalary = 0;
  if (annualInHand > 0) {
    if (hasPF) {
      // G = (annualInHand + PT) / 0.94 (Assuming PF is 12% of basic, basic is 50% of gross -> PF = 6% of gross)
      grossSalary = (annualInHand + pt) / 0.94;
    } else {
      // G = annualInHand + PT
      grossSalary = annualInHand + pt;
    }
  }

  // Basic salary estimation (50% of gross)
  const basicSalary = grossSalary * 0.5;

  // PF calculation
  let estimatedAnnualPF = 0;
  if (annualInHand > 0) {
    if (inputs.hasPF === 'yes') {
      estimatedAnnualPF = inputs.monthlyPF ? Number(inputs.monthlyPF) * 12 : basicSalary * 0.12;
    } else if (inputs.hasPF === 'not_sure') {
      estimatedAnnualPF = basicSalary * 0.12;
    }
  }

  // 2. Standard Deductions
  const newRegimeStandardDeduction = 75000;
  const oldRegimeStandardDeduction = 50000;

  // 3. Deductions calculations (dynamically based on inputs)
  
  // Section 80C: PF + Other 80C investments
  const pfContribution = estimatedAnnualPF;
  const other80C = Number(inputs.investments80C) || 0;
  const total80C = Math.min(150000, pfContribution + other80C);

  // HRA Exemption (Step 3)
  let hraExemption = 0;
  if (inputs.livesInRent === 'yes') {
    const annualRent = (Number(inputs.monthlyRent) || 0) * 12;
    // Estimated HRA allowance = 40% of basic (non-metro default limit)
    const hraAllowance = basicSalary * 0.4;
    hraExemption = Math.max(0, Math.min(
      hraAllowance,
      annualRent - (basicSalary * 0.10),
      basicSalary * 0.4
    ));
  }

  // Health Insurance 80D (Step 6)
  let healthDeductionLimit = 25000;
  if (ageGroup === '60to80' || ageGroup === 'above80') {
    healthDeductionLimit = 50000;
  }
  const healthPremium = Number(inputs.healthInsurancePremium) || 0;
  const total80D = Math.min(healthDeductionLimit, healthPremium);

  // Home Loan 24b (Step 7)
  const homeLoanInterest = Number(inputs.homeLoanInterest) || 0;
  const total24b = Math.min(200000, homeLoanInterest);

  // NPS 80CCD(1B) (Step 8)
  const npsContribution = Number(inputs.npsContribution) || 0;
  const totalNPS = Math.min(50000, npsContribution);

  // 4. Calculate Net Taxable Incomes
  // Professional Tax is deductible from Gross under Section 16(iii) in both regimes
  const newTaxableIncome = Math.max(0, grossSalary - newRegimeStandardDeduction - pt);
  
  // Old regime deductions: Standard deduction + PT + 80C + 80D + 24b + NPS + HRA
  const oldDeductions = oldRegimeStandardDeduction + pt + total80C + total80D + total24b + totalNPS + hraExemption;
  const oldTaxableIncome = Math.max(0, grossSalary - oldDeductions);

  // 5. Apply Slabs to calculate base tax
  
  // New Regime Slabs (FY 2025–26):
  // Up to 4L: 0%
  // 4L to 8L: 5%
  // 8L to 12L: 10%
  // 12L to 16L: 15%
  // 16L to 20L: 20%
  // Above 20L: 30%
  let newBaseTax = 0;
  if (newTaxableIncome > 2000000) {
    newBaseTax += (newTaxableIncome - 2000000) * 0.30;
    newBaseTax += 400000 * 0.20; // 16L to 20L
    newBaseTax += 400000 * 0.15; // 12L to 16L
    newBaseTax += 400000 * 0.10; // 8L to 12L
    newBaseTax += 400000 * 0.05; // 4L to 8L
  } else if (newTaxableIncome > 1600000) {
    newBaseTax += (newTaxableIncome - 1600000) * 0.20;
    newBaseTax += 400000 * 0.15;
    newBaseTax += 400000 * 0.10;
    newBaseTax += 400000 * 0.05;
  } else if (newTaxableIncome > 1200000) {
    newBaseTax += (newTaxableIncome - 1200000) * 0.15;
    newBaseTax += 400000 * 0.10;
    newBaseTax += 400000 * 0.05;
  } else if (newTaxableIncome > 800000) {
    newBaseTax += (newTaxableIncome - 800000) * 0.10;
    newBaseTax += 400000 * 0.05;
  } else if (newTaxableIncome > 400000) {
    newBaseTax += (newTaxableIncome - 400000) * 0.05;
  }

  // Old Regime Slabs (FY 2025–26) based on age exemption:
  let oldBaseTax = 0;
  let oldExemptionLimit = 250000;
  if (ageGroup === '60to80') oldExemptionLimit = 300000;
  if (ageGroup === 'above80') oldExemptionLimit = 500000;

  if (oldExemptionLimit === 250000) {
    if (oldTaxableIncome > 1000000) {
      oldBaseTax += (oldTaxableIncome - 1000000) * 0.30;
      oldBaseTax += 500000 * 0.20; // 5L to 10L
      oldBaseTax += 250000 * 0.05; // 2.5L to 5L
    } else if (oldTaxableIncome > 500000) {
      oldBaseTax += (oldTaxableIncome - 500000) * 0.20;
      oldBaseTax += 250000 * 0.05;
    } else if (oldTaxableIncome > 250000) {
      oldBaseTax += (oldTaxableIncome - 250000) * 0.05;
    }
  } else if (oldExemptionLimit === 300000) {
    if (oldTaxableIncome > 1000000) {
      oldBaseTax += (oldTaxableIncome - 1000000) * 0.30;
      oldBaseTax += 500000 * 0.20;
      oldBaseTax += 200000 * 0.05; // 3L to 5L
    } else if (oldTaxableIncome > 500000) {
      oldBaseTax += (oldTaxableIncome - 500000) * 0.20;
      oldBaseTax += 200000 * 0.05;
    } else if (oldTaxableIncome > 300000) {
      oldBaseTax += (oldTaxableIncome - 300000) * 0.05;
    }
  } else { // 5L limit
    if (oldTaxableIncome > 1000000) {
      oldBaseTax += (oldTaxableIncome - 1000000) * 0.30;
      oldBaseTax += 500000 * 0.20;
    } else if (oldTaxableIncome > 500000) {
      oldBaseTax += (oldTaxableIncome - 500000) * 0.20;
    }
  }

  // 6. Section 87A Rebate & Marginal Relief
  
  // New Regime Rebate:
  // Income <= 12L: Full standard rebate up to ₹60,000 (tax is 0)
  // Income > 12L: Apply marginal relief (the tax payable cannot exceed the income exceeding ₹12 Lakhs)
  let newRebate = 0;
  let newTaxAfterRebate = newBaseTax;

  if (newTaxableIncome <= 1200000) {
    newRebate = newBaseTax;
    newTaxAfterRebate = 0;
  } else {
    // Marginal Relief
    const excessIncome = newTaxableIncome - 1200000;
    if (newBaseTax > excessIncome) {
      newRebate = newBaseTax - excessIncome;
      newTaxAfterRebate = excessIncome;
    }
  }

  // Old Regime Rebate:
  // Income <= 5L: Full rebate up to ₹12,500 (tax is 0)
  let oldRebate = 0;
  let oldTaxAfterRebate = oldBaseTax;

  if (oldTaxableIncome <= 500000) {
    oldRebate = oldBaseTax;
    oldTaxAfterRebate = 0;
  }

  // 7. Education Cess: 4% applied on tax after rebate
  const newCess = newTaxAfterRebate * 0.04;
  const newTotalTax = newTaxAfterRebate + newCess;

  const oldCess = oldTaxAfterRebate * 0.04;
  const oldTotalTax = oldTaxAfterRebate + oldCess;

  const savings = Math.max(0, oldTotalTax - newTotalTax);

  return {
    grossSalary,
    basicSalary,
    estimatedAnnualPF,
    newTaxableIncome,
    oldTaxableIncome,
    newBaseTax,
    oldBaseTax,
    newRebate,
    oldRebate,
    newCess,
    oldCess,
    newTotalTax: Math.round(newTotalTax),
    oldTotalTax: Math.round(oldTotalTax),
    savings: Math.round(savings),
    recommendedRegime: newTotalTax < oldTotalTax ? 'new' : 'old',
    breakdown: {
      pt,
      pf: pfContribution,
      standardDeduction: {
        new: newRegimeStandardDeduction,
        old: oldRegimeStandardDeduction,
      },
      deductions80C: total80C,
      hraExemption,
      deductions80D: total80D,
      deductions24b: total24b,
      deductionsNPS: totalNPS,
    }
  };
};
