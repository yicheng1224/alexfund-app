import React from 'react';
import { useCreation, STEPS_CONFIG } from '../../context/CreationContext';

const StepNavigator = () => {
  const { currentStep, goToStep } = useCreation();
  return (
    <aside>
        <div className="relative">
            <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-gray-700" style={{ transform: 'translateX(-50%)' }}></div>
            <div className="space-y-8">
            {STEPS_CONFIG.map(step => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                return (
                <div key={step.id} className={`relative pl-12 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => isCompleted && goToStep(step.id)}>
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-900 border-gray-600'} ${isActive ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.5)]' : ''}`}>
                    {isCompleted && (<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>)}
                    </div>
                    <p className={`text-sm font-medium transition-colors ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>{step.name}</p>
                </div>
                );
            })}
            </div>
        </div>
    </aside>
  );
};

export default StepNavigator;
