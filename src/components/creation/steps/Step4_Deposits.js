import React from 'react';
import { useCreation } from '../../../context/CreationContext';
import GlassCard from '../../common/GlassCard';
import PolicyBlock from '../../common/PolicyBlock';
import FormNavigation from '../../common/FormNavigation';
import ToggleSwitch from '../../common/ToggleSwitch';

const Step4_Deposits = () => {
    const { formData, updateFormData, nextStep, prevStep } = useCreation();
    const { basics, deposits } = formData;

    const getAssetSymbol = () => {
        const match = basics.denominationAsset.match(/\(([^)]+)\)/);
        return match ? match[1] : basics.denominationAsset;
    };

    const handleUpdate = (data) => {
        updateFormData('deposits', data);
    };

    const isMinError = deposits.minDepositEnabled && (!deposits.minDeposit || parseFloat(deposits.minDeposit) <= 0);
    const isMaxError = deposits.maxDepositEnabled && (!deposits.maxDeposit || parseFloat(deposits.maxDeposit) <= 0);

    return (
        <GlassCard>
            <h2 className="text-2xl font-semibold text-white mb-2">Deposits</h2>
            <div className="bg-yellow-900/50 text-yellow-300 text-sm p-4 rounded-lg mb-8 flex items-start space-x-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p>Settings in this section are restrictive. Enable them to control who can deposit in your vault, and in what amounts. If disabled, anyone can deposit any amount into your vault.</p>
            </div>

            <div className="space-y-8">
                <PolicyBlock title="Limit Wallets Permitted To Deposit" enabled={deposits.limitWalletsEnabled} onToggleChange={() => handleUpdate({ limitWalletsEnabled: !deposits.limitWalletsEnabled })}>
                    <p className="text-sm text-blue-400">This policy acts in concert with but not as a replacement for the policy restricting wallets permitted to receive a share transfer.</p>
                    <div className="inline-block bg-green-900/50 text-green-300 text-xs font-semibold px-2 py-1 rounded-full">Editable Setting</div>
                    <div className="mt-4 space-y-4">
                        <div className={`p-4 border rounded-lg ${deposits.walletLimitOption === 'specify' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                            <label className="flex items-start space-x-3">
                                <input type="radio" name="wallet-limit-option" value="specify" checked={deposits.walletLimitOption === 'specify'} onChange={(e) => handleUpdate({ walletLimitOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center">
                                        <span className="block text-sm font-medium text-white">Limit Wallets Permitted To Deposit</span>
                                        <button className="text-xs text-indigo-400 hover:text-indigo-300">Add Owner Wallet</button>
                                    </div>
                                    <textarea placeholder="Enter address ..." rows="3" className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md"></textarea>
                                    <p className="text-xs text-gray-500 mt-1">Please specify some addresses or choose "Disallow All"</p>
                                </div>
                            </label>
                        </div>
                        <div className={`p-4 border rounded-lg ${deposits.walletLimitOption === 'disallow' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                            <label className="flex items-start space-x-3">
                                <input type="radio" name="wallet-limit-option" value="disallow" checked={deposits.walletLimitOption === 'disallow'} onChange={(e) => handleUpdate({ walletLimitOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                <div>
                                    <span className="block text-sm font-medium text-white">Disallow all depositor addresses</span>
                                    <p className="text-xs text-gray-500 mt-1">This setting can be changed later</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </PolicyBlock>

                <PolicyBlock title="Deposit Limits" enabled={deposits.depositLimitsEnabled} onToggleChange={() => handleUpdate({ depositLimitsEnabled: !deposits.depositLimitsEnabled })}>
                    <p className="text-sm text-gray-400">Restricts the amount of a single deposit with either a minimum, a maximum, or both.</p>
                    <div className="inline-block bg-green-900/50 text-green-300 text-xs font-semibold px-2 py-1 rounded-full">Editable Setting</div>
                    <div className="mt-4 space-y-4">
                        <div className={`p-4 border rounded-lg ${deposits.depositLimitOption === 'specify' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                            <label className="flex items-start space-x-3">
                                <input type="radio" name="deposit-limit-option" value="specify" checked={deposits.depositLimitOption === 'specify'} onChange={(e) => handleUpdate({ depositLimitOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                <div className="flex-grow space-y-4">
                                    <span className="block text-sm font-medium text-white">Specify deposit limits</span>
                                    <div className="flex items-center space-x-4">
                                        <ToggleSwitch checked={deposits.minDepositEnabled} onChange={() => handleUpdate({ minDepositEnabled: !deposits.minDepositEnabled })}/>
                                        <div className="flex-grow">
                                            <label className="block text-sm text-gray-300">Minimum Deposit Amount</label>
                                            <div className="relative">
                                                <input type="number" value={deposits.minDeposit} onChange={(e) => handleUpdate({ minDeposit: e.target.value })} disabled={!deposits.minDepositEnabled} className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md disabled:opacity-50"/>
                                                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">{getAssetSymbol()}</span>
                                            </div>
                                            {isMinError && <p className="text-xs text-red-400 mt-1">Minimum deposit amount cannot be zero. Disable the switch instead</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <ToggleSwitch checked={deposits.maxDepositEnabled} onChange={() => handleUpdate({ maxDepositEnabled: !deposits.maxDepositEnabled })}/>
                                        <div className="flex-grow">
                                            <label className="block text-sm text-gray-300">Maximum Deposit Amount</label>
                                            <div className="relative">
                                                <input type="number" value={deposits.maxDeposit} onChange={(e) => handleUpdate({ maxDeposit: e.target.value })} disabled={!deposits.maxDepositEnabled} className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md disabled:opacity-50"/>
                                                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">{getAssetSymbol()}</span>
                                            </div>
                                            {isMaxError && <p className="text-xs text-red-400 mt-1">Maximum deposit amount cannot be zero. Select "Reject all deposits" instead.</p>}
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div className={`p-4 border rounded-lg ${deposits.depositLimitOption === 'rejectAll' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                            <label className="flex items-start space-x-3">
                                <input type="radio" name="deposit-limit-option" value="rejectAll" checked={deposits.depositLimitOption === 'rejectAll'} onChange={(e) => handleUpdate({ depositLimitOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                <div>
                                    <span className="block text-sm font-medium text-white">Reject all deposits</span>
                                    <p className="text-xs text-gray-500 mt-1">If you choose to reject all deposits, no one (including yourself) will be able to invest in the vault. This setting can be changed later.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </PolicyBlock>
            </div>
            <FormNavigation onBack={prevStep} onNext={nextStep} />
        </GlassCard>
    );
};

export default Step4_Deposits;
