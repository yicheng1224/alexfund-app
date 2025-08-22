import React from 'react';
import ToggleSwitch from './ToggleSwitch';

const PolicyBlock = ({ title, children, enabled, onToggleChange }) => (
    <div className="p-6 rounded-lg border border-gray-700/50 bg-gray-800/40">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <ToggleSwitch checked={enabled} onChange={onToggleChange} />
        </div>
        {enabled && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
                {children}
            </div>
        )}
    </div>
);

export default PolicyBlock;
