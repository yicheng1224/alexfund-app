import React, { useState } from 'react';
import { useCreation } from '../../../context/CreationContext';
import GlassCard from '../../common/GlassCard';
import PolicyBlock from '../../common/PolicyBlock';
import FormNavigation from '../../common/FormNavigation';

const Step7_AssetManagement = () => {
    const { updateFormData, nextStep, prevStep } = useCreation();
    const [policies, setPolicies] = useState({
        'limit-assets': { enabled: false, title: 'Limit Assets To A Specified List', description: 'Restricts the manager to holding only assets from a specified list.' },
        'allowed-adapters': { enabled: false, title: 'Limit Allowed Adapters To A Specified List', description: 'Restricts the manager to interacting only with adapters from a specified list.' },
        'allowed-external-positions': { enabled: false, title: 'Limit Allowed External Positions To A Specified List', description: 'Restricts the manager to interacting only with external positions from a specified list.' }
    });

    const handleToggle = (policyId) => {
        const newPolicies = { ...policies };
        newPolicies[policyId].enabled = !newPolicies[policyId].enabled;
        setPolicies(newPolicies);
        updateFormData('assetManagement', { [policyId]: newPolicies[policyId].enabled });
    };

    return (
        <GlassCard>
            <h2 className="text-2xl font-semibold text-white mb-6">Asset Management</h2>
            <div className="space-y-6">
                {Object.entries(policies).map(([id, policy]) => (
                    <PolicyBlock key={id} title={policy.title} enabled={policy.enabled} onToggleChange={() => handleToggle(id)}>
                        <p className="text-sm text-gray-400">{policy.description}</p>
                        <input type="text" placeholder="Find by name or address" className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md"/>
                    </PolicyBlock>
                ))}
            </div>
            <FormNavigation onBack={prevStep} onNext={nextStep} />
        </GlassCard>
    );
};

export default Step7_AssetManagement;
