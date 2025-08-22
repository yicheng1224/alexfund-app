import React from 'react';
import { useCreation } from '../../context/CreationContext';
import StepNavigator from '../common/StepNavigator';

import Step2_Basics from './steps/Step2_Basics';
import Step3_Fees from './steps/Step3_Fees';
import Step4_Deposits from './steps/Step4_Deposits';
import Step5_SharesTransferability from './steps/Step5_SharesTransferability';
import Step6_Redemptions from './steps/Step6_Redemptions';
import Step7_AssetManagement from './steps/Step7_AssetManagement';
import Step8_Review from './steps/Step8_Review';

const CreateFundFlow = () => {
  const { currentStep } = useCreation();

  if (currentStep === 8) {
      return <Step8_Review />;
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 2: return <Step2_Basics />;
      case 3: return <Step3_Fees />;
      case 4: return <Step4_Deposits />;
      case 5: return <Step5_SharesTransferability />;
      case 6: return <Step6_Redemptions />;
      case 7: return <Step7_AssetManagement />;
      default: return <Step2_Basics />;
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1">
          <h1 className="text-3xl font-bold mb-8 text-left">Create Your Vault</h1>
          <StepNavigator />
        </aside>
        <div className="lg:col-span-3">
          {renderCurrentStep()}
        </div>
      </div>
      <div className="fixed bottom-8 right-8">
          <button className="w-14 h-14 bg-gray-700/80 backdrop-blur-md border border-gray-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
      </div>
    </main>
  );
};

export default CreateFundFlow;
