import React from 'react';
import { useCreation } from '../../../context/CreationContext';
import GlassCard from '../../common/GlassCard';
import PolicyBlock from '../../common/PolicyBlock';
import FormNavigation from '../../common/FormNavigation';

const Step3_Fees = () => {
    const { formData, updateFormData, nextStep, prevStep } = useCreation();
    const { fees } = formData;

    const handleToggle = (feeName) => {
        updateFormData('fees', { [feeName]: { ...fees[feeName], enabled: !fees[feeName].enabled } });
    };

    const handleChange = (feeName, field, value) => {
        updateFormData('fees', { [feeName]: { ...fees[feeName], [field]: value } });
    };

    return (
        <GlassCard>
            <h2 className="text-2xl font-semibold text-white mb-2">Fees</h2>
            <p className="text-sm text-gray-400 mb-8">You can charge several types of fees, all of which are paid out in shares of the vault. To enable a fee, toggle it on and configure it below.</p>
            <div className="space-y-6">
                <PolicyBlock title="Charge Management Fee" enabled={fees.managementFee.enabled} onToggleChange={() => handleToggle('managementFee')}>
                    <p className="text-sm text-gray-400">If enabled, a flat fee measured as an annual percent of total assets under management.</p>
                    <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full">Semi-permanent Setting</div>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Management Fee Rate (%)</label>
                            <input type="number" value={fees.managementFee.rate} onChange={(e) => handleChange('managementFee', 'rate', e.target.value)} placeholder="1.0" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Recipient Address (optional)</label>
                            <input type="text" value={fees.managementFee.recipient} onChange={(e) => handleChange('managementFee', 'recipient', e.target.value)} placeholder="Enter address" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                    </div>
                </PolicyBlock>

                <PolicyBlock title="Charge Performance Fee" enabled={fees.performanceFee.enabled} onToggleChange={() => handleToggle('performanceFee')}>
                    <p className="text-sm text-gray-400">If enabled, measured based on the vault's performance. The performance fee is subject to a high-water mark.</p>
                    <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full">Semi-permanent Setting</div>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Performance Fee Rate (%)</label>
                            <input type="number" value={fees.performanceFee.rate} onChange={(e) => handleChange('performanceFee', 'rate', e.target.value)} placeholder="10.0" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Recipient Address (optional)</label>
                            <input type="text" value={fees.performanceFee.recipient} onChange={(e) => handleChange('performanceFee', 'recipient', e.target.value)} placeholder="Enter address" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                    </div>
                </PolicyBlock>

                <PolicyBlock title="Charge Entrance Fee" enabled={fees.entranceFee.enabled} onToggleChange={() => handleToggle('entranceFee')}>
                    <p className="text-sm text-gray-400">If enabled, entrance fees are charged with every new deposit.</p>
                    <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full">Semi-permanent Setting</div>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Entrance Fee allocated to</label>
                            <select value={fees.entranceFee.allocatedTo} onChange={(e) => handleChange('entranceFee', 'allocatedTo', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 border-gray-600 rounded-md">
                                <option value="vault">Vault</option>
                                <option value="manager">Manager or other recipient</option>
                            </select>
                        </div>
                        {fees.entranceFee.allocatedTo === 'manager' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Recipient Address</label>
                                <input type="text" value={fees.entranceFee.recipient} onChange={(e) => handleChange('entranceFee', 'recipient', e.target.value)} placeholder="Enter address" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Entrance Fee Rate (%)</label>
                            <input type="number" value={fees.entranceFee.rate} onChange={(e) => handleChange('entranceFee', 'rate', e.target.value)} placeholder="1.0" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                    </div>
                </PolicyBlock>

                <PolicyBlock title="Charge Exit Fee" enabled={fees.exitFee.enabled} onToggleChange={() => handleToggle('exitFee')}>
                     <p className="text-sm text-gray-400">If enabled, exit fees are charged with every redemption, set separately for in-kind and specific asset redemptions.</p>
                    <div className="inline-block bg-yellow-900/50 text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full">Semi-permanent Setting</div>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Exit Fee allocated to</label>
                            <select value={fees.exitFee.allocatedTo} onChange={(e) => handleChange('exitFee', 'allocatedTo', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 border-gray-600 rounded-md">
                                <option value="vault">Vault</option>
                                <option value="manager">Manager or other recipient</option>
                            </select>
                        </div>
                        {fees.exitFee.allocatedTo === 'manager' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Recipient Address</label>
                                <input type="text" value={fees.exitFee.recipient} onChange={(e) => handleChange('exitFee', 'recipient', e.target.value)} placeholder="Enter address" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Exit Fee Rate for in-kind redemptions (%)</label>
                            <input type="number" value={fees.exitFee.inKindRate} onChange={(e) => handleChange('exitFee', 'inKindRate', e.target.value)} placeholder="1.0" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Exit Fee Rate for redemptions in specific assets (%)</label>
                            <input type="number" value={fees.exitFee.specificRate} onChange={(e) => handleChange('exitFee', 'specificRate', e.target.value)} placeholder="5.0" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                        </div>
                    </div>
                </PolicyBlock>
            </div>
            <FormNavigation onBack={prevStep} onNext={nextStep} />
        </GlassCard>
    );
};

export default Step3_Fees;
