import React, { useState, useEffect } from 'react';
import { useCreation } from '../../../context/CreationContext';
import GlassCard from '../../common/GlassCard';
import PolicyBlock from '../../common/PolicyBlock';
import FormNavigation from '../../common/FormNavigation';

const Step6_Redemptions = () => {
    const { formData, updateFormData, nextStep, prevStep } = useCreation();
    const { redemptions } = formData;
    const [error, setError] = useState('');

    const handleToggle = (fieldName) => {
        updateFormData('redemptions', { [fieldName]: !redemptions[fieldName] });
    };

    const handleUpdate = (data) => {
        updateFormData('redemptions', data);
    };

    const handleLockupChange = (e) => {
        const value = e.target.value;
        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 24)) {
            handleUpdate({ lockUpPeriod: value });
        }
    };

    const validate = () => {
        const period = parseFloat(redemptions.lockUpPeriod);
        if (isNaN(period) || redemptions.lockUpPeriod.trim() === '') {
            setError('Required');
            return false;
        }
        if (period < 0 || period > 24) {
            setError('Value must be between 0 and 24.');
            return false;
        }
        setError('');
        return true;
    };

    useEffect(() => {
        validate();
    }, [redemptions.lockUpPeriod]);

    const handleNext = () => {
        if (validate()) {
            nextStep();
        }
    };

    const handleThresholdChange = (id, field, value) => {
        const newThresholds = redemptions.thresholds.map(t =>
            t.id === id ? { ...t, [field]: value } : t
        );
        handleUpdate({ thresholds: newThresholds });
    };

    const addThreshold = () => {
        const newId = (redemptions.thresholds[redemptions.thresholds.length - 1]?.id || 0) + 1;
        handleUpdate({ thresholds: [...redemptions.thresholds, { id: newId, amount: '0', token: '' }] });
    };

    const removeThreshold = (id) => {
        handleUpdate({ thresholds: redemptions.thresholds.filter(t => t.id !== id) });
    };

    return (
        <GlassCard>
            <h2 className="text-2xl font-semibold text-white mb-2">Redemptions</h2>
            <div className="bg-yellow-900/50 text-yellow-300 text-sm p-4 rounded-lg mb-8">
                <p>Settings in this section are restrictive. Enable them to control how your depositors can redeem their shares.</p>
            </div>
            <div className="space-y-4">
                <div className="border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold">Required</h3>
                    <div className="mt-4 p-6 rounded-lg bg-gray-800/50">
                        <h4 className="text-md font-semibold">Shares Lock-Up Period</h4>
                        <p className="text-sm text-gray-400 mt-2">Defines the amount of time that must pass after a user's last receipt of shares before that user is allowed to redeem or transfer shares. This is an arbitrage protection, and funds that have untrusted depositors should use a non-zero value. The recommended value is 24 hours.</p>
                        <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full mt-4">Semi-permanent Setting</div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-300">Shares Lock-Up Period</label>
                            <div className="relative">
                                <input type="number" value={redemptions.lockUpPeriod} onChange={handleLockupChange} min="0" max="24" step="0.1" className={`mt-1 w-full px-3 py-2 bg-gray-800 border rounded-md ${error ? 'border-red-500' : 'border-gray-600'}`} />
                                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">hours</span>
                            </div>
                            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
                        </div>
                    </div>
                </div>
                <div className="border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold">Optional</h3>
                    <div className="mt-4 space-y-6">
                        <PolicyBlock title="Restrict Assets For Redemption" enabled={redemptions.restrictAssets} onToggleChange={() => handleToggle('restrictAssets')}>
                            <p className="text-sm text-gray-400">Restricts the assets for which a depositor may redeem their vault shares. If this policy is not enabled, depositors may redeem their shares in-kind or in any arbitrary combination of assets held by your vault.</p>
                            <div className="mt-4 space-y-4">
                                <div className={`p-4 border rounded-lg ${redemptions.restrictAssetsOption === 'specify' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                                    <label>
                                        <input type="radio" name="restrict-assets-option" value="specify" checked={redemptions.restrictAssetsOption === 'specify'} onChange={(e) => handleUpdate({ restrictAssetsOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mr-3"/>
                                        <span className="text-sm font-medium text-white">Restrict Assets For Redemption</span>
                                    </label>
                                    <input type="text" placeholder="Search for assets..." className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md" />
                                </div>
                                <div className={`p-4 border rounded-lg ${redemptions.restrictAssetsOption === 'in-kind' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                                    <label className="flex items-start space-x-3">
                                        <input type="radio" name="restrict-assets-option" value="in-kind" checked={redemptions.restrictAssetsOption === 'in-kind'} onChange={(e) => handleUpdate({ restrictAssetsOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                        <div>
                                            <span className="block text-sm font-medium text-white">Only allow in-kind redemption</span>
                                            <p className="text-xs text-gray-500 mt-1">This setting can be changed later</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </PolicyBlock>

                        <PolicyBlock title="Specific Asset Redemption Threshold" enabled={redemptions.specificAssetThreshold} onToggleChange={() => handleToggle('specificAssetThreshold')}>
                            <p className="text-sm text-gray-400">Restricts the value of a specific-asset redemption by setting a minimum balance of that asset that the vault must maintain post-withdrawal.</p>
                            <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full mt-2">Semi-permanent Setting</div>
                            <div className="mt-4 space-y-3">
                                {redemptions.thresholds.map((t, index) => (
                                    <div key={t.id} className="flex items-center space-x-2">
                                        <input type="number" value={t.amount} onChange={(e) => handleThresholdChange(t.id, 'amount', e.target.value)} className={`w-1/2 px-3 py-2 bg-gray-700 border rounded-md ${t.amount <= 0 && index > 0 ? 'border-red-500' : 'border-gray-500'}`} />
                                        <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded-md flex items-center justify-between">
                                            <span>{t.token || 'Select a token'}</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                        <button onClick={() => removeThreshold(t.id)} className="p-2 text-gray-500 hover:text-white">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addThreshold} className="mt-2 flex items-center space-x-2 text-indigo-400 hover:text-indigo-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                <span>Add Threshold</span>
                            </button>
                        </PolicyBlock>

                        <PolicyBlock title="Addresses Allowed To Redeem Shares For Specific Assets" enabled={redemptions.allowedRedeemers} onToggleChange={() => handleToggle('allowedRedeemers')}>
                            <p className="text-sm text-gray-400">This policy restricts wallets permitted to receive redeem shares for specific assets.</p>
                            <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full mt-2">Semi-permanent Setting</div>
                            <div className="mt-4 space-y-4">
                                <div className={`p-4 border rounded-lg ${redemptions.allowedRedeemersOption === 'specify' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                                    <label className="flex items-start space-x-3">
                                        <input type="radio" name="allowed-redeemers-option" value="specify" checked={redemptions.allowedRedeemersOption === 'specify'} onChange={(e) => handleUpdate({ allowedRedeemersOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                        <div className="flex-grow">
                                            <span className="block text-sm font-medium text-white">Addresses allowed to redeem shares for specific assets</span>
                                            <textarea placeholder="Enter address ..." rows="3" className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md"></textarea>
                                        </div>
                                    </label>
                                </div>
                                <div className={`p-4 border rounded-lg ${redemptions.allowedRedeemersOption === 'disallow' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                                    <label className="flex items-start space-x-3">
                                        <input type="radio" name="allowed-redeemers-option" value="disallow" checked={redemptions.allowedRedeemersOption === 'disallow'} onChange={(e) => handleUpdate({ allowedRedeemersOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                                        <div>
                                            <span className="block text-sm font-medium text-white">Disallow all depositor addresses</span>
                                            <p className="text-xs text-gray-500 mt-1">This setting can be changed later</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </PolicyBlock>
                    </div>
                </div>
            </div>
            <FormNavigation onBack={prevStep} onNext={handleNext} disabled={!!error} />
        </GlassCard>
    );
};

export default Step6_Redemptions;
