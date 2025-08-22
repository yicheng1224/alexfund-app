import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CreationProvider } from './context/CreationContext';

import TopHeader from './components/common/TopHeader';
import Header from './components/common/Header';
import RoleSelectionPage from './components/pages/RoleSelectionPage';
import InvestorDashboard from './components/pages/InvestorDashboard';
import ManagerDashboard from './components/pages/ManagerDashboard';
import CreateFundFlow from './components/creation/CreateFundFlow';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('role-selection');
  const { walletAddress, setWalletAddress } = useApp();

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
        setWalletAddress(null);
        setCurrentPage('role-selection');
      } else if (accounts[0] !== walletAddress) {
        console.log('Account changed, returning to home.');
        setWalletAddress(accounts[0]);
        setCurrentPage('role-selection');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [walletAddress, setWalletAddress]);

  const handleSelectRole = (role) => {
    if (role === 'investor') {
      setCurrentPage('investor-dashboard');
    } else if (role === 'manager') {
      setCurrentPage('manager-dashboard');
    }
  };

  const startCreation = () => setCurrentPage('creation');
  const backToHome = () => setCurrentPage('role-selection');

  switch (currentPage) {
    case 'role-selection':
      return <RoleSelectionPage onSelectRole={handleSelectRole} />;
    
    case 'investor-dashboard':
      return (
          <>
              <TopHeader />
              <Header onBackToHome={backToHome} />
              <InvestorDashboard />
          </>
      );

    case 'manager-dashboard':
      return (
          <>
              <TopHeader />
              <Header onBackToHome={backToHome} />
              <ManagerDashboard onStartCreation={startCreation} />
          </>
      );

    case 'creation':
      return (
          <>
              <TopHeader />
              <Header onBackToHome={backToHome} />
              <CreationProvider><CreateFundFlow /></CreationProvider>
          </>
      );
    default:
      return <RoleSelectionPage onSelectRole={handleSelectRole} />;
  }
};

export default function App() {
  return (
    <AppProvider>
        <div className="dark">
          <div className="bg-gray-900 text-white antialiased min-h-screen flex flex-col font-sans">
            <style>{`.toggle-checkbox:checked { right: 0; border-color: #6366F1; } .toggle-checkbox:checked + .toggle-label { background-color: #6366F1; }`}</style>
            <AppContent />
          </div>
        </div>
    </AppProvider>
  );
}
