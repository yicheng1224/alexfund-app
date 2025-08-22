import React from 'react';

const FormNavigation = ({ onBack, onNext, disabled = false }) => (
  <div className="pt-8 flex justify-end space-x-4">
    <button type="button" onClick={onBack} className="text-gray-300 hover:text-white font-medium py-2 px-6 rounded-lg transition-colors border border-gray-600">Back</button>
    <button type="button" onClick={onNext} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed">Next</button>
  </div>
);

export default FormNavigation;
