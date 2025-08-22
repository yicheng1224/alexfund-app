import React, { useState, useEffect } from 'react';
import { useCreation } from '../../../context/CreationContext';
import GlassCard from '../../common/GlassCard';
import FormNavigation from '../../common/FormNavigation';

const Step2_Basics = () => {
  const { formData, updateFormData, nextStep, prevStep } = useCreation();
  const { basics } = formData;
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const englishRegex = /^[a-zA-Z0-9\s]*$/;

    if (!basics.name) newErrors.name = 'Name is required.';
    else if (basics.name.length < 4) newErrors.name = 'Name must be at least 4 characters.';
    else if (!englishRegex.test(basics.name)) newErrors.name = 'Name can only contain English letters and numbers.';

    if (!basics.symbol) newErrors.symbol = 'Symbol is required.';
    else if (basics.symbol.length < 4) newErrors.symbol = 'Symbol must be at least 4 characters.';
    else if (!englishRegex.test(basics.symbol)) newErrors.symbol = 'Symbol can only contain English letters and numbers.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    updateFormData('basics', { [e.target.id]: e.target.value });
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  useEffect(() => {
    validate(); // Real-time validation
  }, [basics]);

  return (
    <GlassCard>
      <h2 className="text-2xl font-semibold text-white mb-6">Basics</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
          <input type="text" id="name" value={basics.name} onChange={handleChange} placeholder="The name of your vault." className={`mt-1 block w-full px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-indigo-500'}`} />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300">Symbol</label>
          <input type="text" id="symbol" value={basics.symbol} onChange={handleChange} placeholder="The symbol of the tokenized shares of your vault." className={`mt-1 block w-full px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 transition ${errors.symbol ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-indigo-500'}`} />
          {errors.symbol && <p className="mt-1 text-xs text-red-400">{errors.symbol}</p>}
        </div>
        <div>
          <label htmlFor="denominationAsset" className="block text-sm font-medium text-gray-300">Denomination Asset</label>
          <select id="denominationAsset" value={basics.denominationAsset} onChange={handleChange} className="mt-1 block w-full pl-4 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
            <option>USDT</option>
            <option>USDC</option>
            <option>WETH</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">The denomination asset is the asset in which depositors deposit into your vault and in which the vault's share price and the performance are measured.</p>
        </div>
      </div>
      <FormNavigation onBack={prevStep} onNext={handleNext} disabled={Object.keys(errors).length > 0} />
    </GlassCard>
  );
};

export default Step2_Basics;
