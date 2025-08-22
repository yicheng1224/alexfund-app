import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useCreation } from '../../../context/CreationContext';
import { contractService } from '../../../services/contractService.js';

const Step8_Review = () => {
  const { formData, prevStep } = useCreation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const { basics, fees, deposits, sharesTransferability, redemptions } = formData;

  const handleCreateVault = async () => {
    if (!termsAccepted || isCreating) return;

    setIsCreating(true);
    setError('');

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet.");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const result = await contractService.createFund(signer, formData);

      alert(`Fund created successfully!\nComptroller: ${result.comptrollerProxy}\nVault: ${result.vaultProxy}`);

    } catch (err) {
      console.error("Fund creation failed:", err);
      const errorMessage = err.message || "An unknown error occurred.";
      setError(errorMessage);
      alert(`Fund creation failed: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const SummaryItem = ({ label, value, children }) => (
      <div className="flex justify-between py-3 border-b border-gray-700 last:border-b-0">
          <span className="text-gray-400">{label}</span>
          <span className="font-medium text-white text-right">{value || children}</span>
      </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold">Review</h1>
        <p className="text-gray-400 mt-2">Please review the vault configuration carefully before creating.<br/>All configuration settings are permanent (except where indicated).</p>

        <div className="mt-8 space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Vault Basics</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Vault Name" value={basics.name} />
                    <SummaryItem label="Vault Symbol" value={basics.symbol} />
                    <SummaryItem label="Denomination Asset" value={basics.denominationAsset} />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Fees</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Management Fee" value={fees.managementFee.enabled ? `${fees.managementFee.rate}%` : 'Disabled'} />
                    <SummaryItem label="Performance Fee" value={fees.performanceFee.enabled ? `${fees.performanceFee.rate}%` : 'Disabled'} />
                    <SummaryItem label="Exit Fee">
                        {fees.exitFee.enabled ? (
                            <div className="flex flex-col items-end">
                                <span>{fees.exitFee.inKindRate}% for in kind redemptions</span>
                                <span>{fees.exitFee.specificRate}% for specific assets redemptions</span>
                            </div>
                        ) : 'Disabled'}
                    </SummaryItem>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Policies</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Limit Wallets Permitted To Deposit" value={deposits.limitWalletsEnabled ? 'Configured' : 'No addresses configured for this policy'} />
                    <SummaryItem label="Restrict Wallets Permitted To Receive A Share Transfer" value={sharesTransferability.restricted ? 'Configured' : 'No addresses configured for this policy'} />
                    <SummaryItem label="Deposit Limits" value={deposits.depositLimitsEnabled ? `Minimum: ${deposits.minDeposit} ${basics.denominationAsset}` : 'Not configured'} />
                </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold mb-4">Other Settings</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Shares Action Timelock" value={`${redemptions.lockUpPeriod} hours`} />
                </div>
            </div>
        </div>

        <div className="mt-8">
            <label className="flex items-center space-x-3">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-500 text-indigo-600 rounded focus:ring-indigo-500"/>
                <span className="text-gray-300">I have read & agree to the <a href="#" className="text-indigo-400 hover:underline">Terms & Conditions</a>.</span>
            </label>
            {error && <p className="mt-2 text-sm text-red-400">Error: {error}</p>}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex justify-between items-center">
            <button onClick={prevStep} className="text-gray-300 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors border border-gray-600">Back</button>
            <button onClick={handleCreateVault} disabled={!termsAccepted || isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isCreating ? 'Creating...' : 'Create'}
            </button>
        </div>
    </div>
  );
};

export default Step8_Review;
