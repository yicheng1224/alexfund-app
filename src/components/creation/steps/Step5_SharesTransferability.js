import React from 'react';
import { useCreation } from '../../../context/CreationContext';
import GlassCard from '../../common/GlassCard';
import PolicyBlock from '../../common/PolicyBlock';
import FormNavigation from '../../common/FormNavigation';

const Step5_SharesTransferability = () => {
    const { formData, updateFormData, nextStep, prevStep } = useCreation();
    const { sharesTransferability } = formData;

    return (
        <GlassCard>
            <h2 className="text-2xl font-semibold text-white mb-2">Shares Transferability</h2>
            <div className="bg-yellow-900/50 text-yellow-300 text-sm p-4 rounded-lg mb-8">
                <p>Settings in this section are restrictive. Enable them to determine who can receive your vault's shares via direct transfer.</p>
            </div>
            <PolicyBlock title="Restrict Wallets Permitted To Receive A Share Transfer" enabled={sharesTransferability.restricted} onToggleChange={() => updateFormData('sharesTransferability', { restricted: !sharesTransferability.restricted })}>
                <p className="text-sm text-gray-400">If enabled, restricts the potential recipients of shares transferred outside of the normal asset deposit and share minting process.</p>
                <p className="text-sm text-blue-400 mt-2">This policy acts in concert with but not as a replacement for the policy which restricts wallets able to receive minted shares.</p>
                <p className="text-sm text-gray-400 mt-2">In general, if you enable this policy to restrict who can receive shares that are already minted, you should also restrict who can mint new shares to the same list of wallets.</p>
                <div className="inline-block bg-green-900/50 text-green-300 text-xs font-semibold px-2 py-1 rounded-full mt-4">Editable Setting</div>
                <div className="mt-4 space-y-4">
                    <div className={`p-4 border rounded-lg ${sharesTransferability.transferOption === 'restrict' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                        <label className="flex items-start space-x-3">
                            <input type="radio" name="transfer-option" value="restrict" checked={sharesTransferability.transferOption === 'restrict'} onChange={(e) => updateFormData('sharesTransferability', { transferOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                            <div className="flex-grow">
                                <span className="block text-sm font-medium text-white">Restrict Wallets Permitted To Receive A Share Transfer</span>
                                <textarea placeholder="Enter addresses, one per line..." rows="3" className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-md"></textarea>
                            </div>
                        </label>
                    </div>
                    <div className={`p-4 border rounded-lg ${sharesTransferability.transferOption === 'disallow' ? 'border-indigo-500/50 bg-indigo-900/20 ring-2 ring-indigo-400' : 'border-gray-700'}`}>
                        <label className="flex items-start space-x-3">
                            <input type="radio" name="transfer-option" value="disallow" checked={sharesTransferability.transferOption === 'disallow'} onChange={(e) => updateFormData('sharesTransferability', { transferOption: e.target.value })} className="form-radio h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 mt-0.5"/>
                            <div>
                                <span className="block text-sm font-medium text-white">Disallow all transfers</span>
                                <p className="text-xs text-gray-500 mt-1">This setting can be changed later</p>
                            </div>
                        </label>
                    </div>
                </div>
            </PolicyBlock>
            <FormNavigation onBack={prevStep} onNext={nextStep} />
        </GlassCard>
    );
};

export default Step5_SharesTransferability;
