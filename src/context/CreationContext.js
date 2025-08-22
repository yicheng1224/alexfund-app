import React, { useState, createContext, useContext, useEffect } from 'react';

export const STEPS_CONFIG = [
  { id: 1, name: 'Before you start' },
  { id: 2, name: 'Basics' },
  { id: 3, name: 'Fees' },
  { id: 4, name: 'Deposits' },
  { id: 5, name: 'Shares transferability' },
  { id: 6, name: 'Redemptions' },
  { id: 7, name: 'Asset management' },
  { id: 8, name: 'Review' },
];

export const INITIAL_FORM_DATA = {
  basics: { name: '', symbol: '', denominationAsset: 'USDC' },
  fees: {
    managementFee: { enabled: false, rate: 1.00, recipient: '' },
    performanceFee: { enabled: false, rate: 10.00, recipient: '' },
    entranceFee: { enabled: false, rate: 1.0, allocatedTo: 'vault', recipient: '' },
    exitFee: { enabled: false, inKindRate: 0.00, specificRate: 1.00, allocatedTo: 'vault', recipient: '' },
  },
  deposits: {
    limitWalletsEnabled: false, walletLimitOption: 'specify',
    depositLimitsEnabled: false, depositLimitOption: 'specify',
    minDepositEnabled: false, minDeposit: '0', maxDepositEnabled: false, maxDeposit: '0',
  },
  sharesTransferability: { restricted: false, transferOption: 'restrict' },
  redemptions: {
    lockUpPeriod: '0', restrictAssets: false, restrictAssetsOption: 'specify',
    specificAssetThreshold: false, thresholds: [{id: 1, amount: '0', token: ''}],
    allowedRedeemers: false, allowedRedeemersOption: 'specify',
  },
  assetManagement: {},
};

const CreationContext = createContext();

export const CreationProvider = ({ children }) => {
  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = localStorage.getItem('fundCreationDraft');
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (error) {
      console.error("Failed to read draft from localStorage:", error);
    }
    return INITIAL_FORM_DATA;
  });

  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    try {
      localStorage.setItem('fundCreationDraft', JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save draft to localStorage:", error);
    }
  }, [formData]);

  const nextStep = () => currentStep < STEPS_CONFIG.length && setCurrentStep(prev => prev + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(prev => prev - 1);
  const goToStep = (stepId) => stepId < currentStep && setCurrentStep(stepId);
  const updateFormData = (stepKey, data) => setFormData(prev => ({ ...prev, [stepKey]: { ...prev[stepKey], ...data } }));

  const value = { currentStep, formData, nextStep, prevStep, goToStep, updateFormData };
  return <CreationContext.Provider value={value}>{children}</CreationContext.Provider>;
};

export const useCreation = () => useContext(CreationContext);
