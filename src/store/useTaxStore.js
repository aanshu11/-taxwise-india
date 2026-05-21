import { create } from 'zustand';

const initialInputs = {
  salary: '',
  ageGroup: 'under60', // 'under60' | '60to80' | 'above80'
  livesInRent: null, // null | 'yes' | 'no'
  monthlyRent: '',
  hasPF: null, // null | 'yes' | 'no' | 'not_sure'
  monthlyPF: '',
  hasInvestments80C: null, // null | 'yes' | 'no'
  investments80C: '',
  hasHealthInsurance: null, // null | 'yes' | 'no'
  healthInsurancePremium: '',
  hasHomeLoan: null, // null | 'yes' | 'no'
  homeLoanInterest: '',
  hasNPS: null, // null | 'yes' | 'no'
  npsContribution: '',
};

export const useTaxStore = create((set) => ({
  // Navigation / View State
  view: 'landing', // 'landing' | 'wizard' | 'results'
  currentStep: 1, // 1 to 8

  // User Inputs
  inputs: { ...initialInputs },

  // Setters
  setView: (view) => set({ view }),
  setStep: (step) => set({ currentStep: Math.max(1, Math.min(8, step)) }),
  
  updateInput: (name, value) => 
    set((state) => ({
      inputs: {
        ...state.inputs,
        [name]: value,
      },
    })),
    
  resetStore: () => 
    set({
      view: 'landing',
      currentStep: 1,
      inputs: { ...initialInputs },
    }),
}));
