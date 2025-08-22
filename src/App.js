import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

// =======================================================================
// 0. 圖示元件 (SVG Icons)
// =======================================================================
const EthereumIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22.75C18.2132 22.75 23.25 17.7132 23.25 11.5C23.25 5.2868 18.2132 0.25 12 0.25C5.7868 0.25 0.75 5.2868 0.75 11.5C0.75 17.7132 5.7868 22.75 12 22.75Z" fill="#627EEA"/><path d="M12.022 5.625L11.84 6.2025V14.6715L12.022 14.853L16.2735 12.189L12.022 5.625Z" fill="white" fillOpacity="0.602"/><path d="M12.022 5.625L7.77051 12.189L12.022 14.853V5.625Z" fill="white"/><path d="M12.022 15.8294L11.9115 15.9284V18.3749L12.022 18.6249L16.275 13.1654L12.022 15.8294Z" fill="white" fillOpacity="0.602"/><path d="M12.022 18.625V15.8295L7.77051 13.1655L12.022 18.625Z" fill="white"/></svg>;
const ArbitrumIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11.5" fill="#2D374B" stroke="#909090" strokeWidth="1"/><path d="M16.5 8.25L12 12L16.5 15.75" stroke="#28A0F0" strokeWidth="2"/><path d="M7.5 15.75L12 12L7.5 8.25" stroke="white" strokeWidth="2"/></svg>;
const BaseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11.5" fill="#0052FF" stroke="#909090" strokeWidth="1"/><path d="M7.5 12H16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PolygonIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.316 15.168L12.684 18L8.052 15.168V9.504L12.684 6.672L17.316 9.504V15.168Z" fill="#8247E5"/><path d="M12.684 18L12 17.628V12.372L12.684 12V18Z" fill="#6A2CB3"/><path d="M12.684 6.672L12 7.044V12.372L12.684 12V6.672Z" fill="#6A2CB3"/></svg>;
const ChevronDownIcon = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// =======================================================================
// 1. 設定檔 (Configuration) & 自定義 Hooks
// =======================================================================
const STEPS_CONFIG = [
  { id: 1, name: 'Before you start' },
  { id: 2, name: 'Basics' },
  { id: 3, name: 'Fees' },
  { id: 4, name: 'Deposits' },
  { id: 5, name: 'Shares transferability' },
  { id: 6, name: 'Redemptions' },
  { id: 7, name: 'Asset management' },
  { id: 8, name: 'Review' },
];

const INITIAL_FORM_DATA = {
  basics: { name: '', symbol: '', denominationAsset: 'USDC' },
  fees: {
    managementFee: { enabled: false, rate: 1.00, recipient: '' },
    performanceFee: { enabled: false, rate: 10.00, recipient: '' },
    entranceFee: { enabled: false, rate: 1.0, allocatedTo: 'vault', recipient: '' },
    exitFee: { enabled: false, inKindRate: 0.00, specificRate: 1.00, allocatedTo: 'vault', recipient: '' },
  },
  deposits: {
    limitWalletsEnabled: false, walletLimitOption: 'specify',
    depositLimitsEnabled: false, depositLimitOption: 'specify',
    minDepositEnabled: false, minDeposit: '0', maxDepositEnabled: false, maxDeposit: '0',
  },
  sharesTransferability: { restricted: false, transferOption: 'restrict' },
  redemptions: {
    lockUpPeriod: '0', restrictAssets: false, restrictAssetsOption: 'specify',
    specificAssetThreshold: false, thresholds: [{id: 1, amount: '0', token: ''}],
    allowedRedeemers: false, allowedRedeemersOption: 'specify',
  },
  assetManagement: {},
};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};


// =======================================================================
// 2. 全域狀態管理 (Context API)
// =======================================================================
const AppContext = createContext();
const CreationContext = createContext();

const AppProvider = ({ children }) => {
    const [network, setNetwork] = useState('Ethereum');
    const [currency, setCurrency] = useState('USD');
    const [walletAddress, setWalletAddress] = useState(null);
    const [userFunds, setUserFunds] = useState([]); 

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                return accounts[0];
            } catch (error) {
                console.error("User rejected wallet connection:", error);
                throw error;
            }
        } else {
            alert("Please install MetaMask!");
            throw new Error("MetaMask not found");
        }
    };

    const value = { network, setNetwork, currency, setCurrency, walletAddress, setWalletAddress, connectWallet, userFunds };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const CreationProvider = ({ children }) => {
  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = localStorage.getItem('fundCreationDraft');
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (error) {
      console.error("讀取草稿失敗:", error);
    }
    return INITIAL_FORM_DATA;
  });

  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    try {
      localStorage.setItem('fundCreationDraft', JSON.stringify(formData));
    } catch (error) {
      console.error("儲存草稿失敗:", error);
    }
  }, [formData]);

  const nextStep = () => currentStep < STEPS_CONFIG.length && setCurrentStep(prev => prev + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(prev => prev - 1);
  const goToStep = (stepId) => stepId < currentStep && setCurrentStep(stepId);
  const updateFormData = (stepKey, data) => setFormData(prev => ({ ...prev, [stepKey]: { ...prev[stepKey], ...data } }));
  
  const value = { currentStep, formData, nextStep, prevStep, goToStep, updateFormData };
  return <CreationContext.Provider value={value}>{children}</CreationContext.Provider>;
};

const useApp = () => useContext(AppContext);
const useCreation = () => useContext(CreationContext);

// =======================================================================
// 3. 通用 UI 元件 (Reusable Components)
// =======================================================================
const GlassCard = ({ children, className = '' }) => <div className={`p-6 sm:p-8 rounded-2xl shadow-lg bg-gray-800/60 backdrop-filter backdrop-blur-xl border border-white/10 ${className}`}>{children}</div>;

const TopHeader = () => {
    const { network, setNetwork, currency, setCurrency, walletAddress } = useApp();
    const networks = { Ethereum: <EthereumIcon />, Arbitrum: <ArbitrumIcon />, Base: <BaseIcon />, Polygon: <PolygonIcon /> };
    const currencies = ['ETH', 'BTC', 'USD', 'EUR', 'CHF', 'GBP', 'AUD', 'JPY'];
    
    const Dropdown = ({ options, selected, setSelected, renderOption }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);
        useClickOutside(dropdownRef, () => setIsOpen(false));

        return (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                    {renderOption(selected)}
                    <ChevronDownIcon />
                </button>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20">
                        <div className="p-2 text-sm text-gray-400">Switch to:</div>
                        {Object.keys(options).map(key => (
                            <button key={key} onClick={() => { setSelected(key); setIsOpen(false); }} className="w-full text-left flex items-center space-x-3 px-4 py-2 hover:bg-gray-700/50">
                                {renderOption(key)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-900 border-b border-gray-700 relative z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 text-sm">
                <div className="flex items-center space-x-4">
                    {walletAddress && <span className="text-gray-400">{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>}
                </div>
                <div className="flex items-center space-x-2">
                    <Dropdown options={networks} selected={network} setSelected={setNetwork} renderOption={(key) => <><span className="w-6 h-6">{networks[key]}</span><span>{key}</span></>} />
                    <Dropdown options={currencies.reduce((a, v) => ({...a, [v]: v}), {})} selected={currency} setSelected={setCurrency} renderOption={(key) => <span>{key}</span>} />
                    <button className="p-2 rounded-md hover:bg-gray-700">⚙️</button>
                    <button className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700">Sign In</button>
                </div>
            </div>
        </div>
    );
};


const Header = ({ onBackToHome }) => (
    <header className="sticky top-0 z-40 bg-gray-900/70 backdrop-filter backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToHome(); }} className="text-2xl font-bold">AlexFund</a>
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">基金列表</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">關於我們</a>
          </nav>
        </div>
      </div>
    </header>
);

const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-gray-800">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="mb-6">{children}</div>
                <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    確定
                </button>
            </div>
        </div>
    );
};

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

const FormNavigation = ({ onBack, onNext, disabled = false }) => (
  <div className="pt-8 flex justify-end space-x-4">
    <button type="button" onClick={onBack} className="text-gray-300 hover:text-white font-medium py-2 px-6 rounded-lg transition-colors border border-gray-600">Back</button>
    <button type="button" onClick={onNext} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed">Next</button>
  </div>
);

const ToggleSwitch = ({ id, checked, onChange }) => (
  <div className="relative inline-block w-10 mr-2 align-middle select-none">
    <input type="checkbox" id={id} checked={checked} onChange={onChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
    <label htmlFor={id} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
  </div>
);

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


// =======================================================================
// 4. 創建流程的各個步驟頁面 (Step Components)
// =======================================================================

const Step2_Basics = () => {
  const { formData, updateFormData, nextStep, prevStep } = useCreation();
  const { basics } = formData;
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const englishRegex = /^[a-zA-Z0-9\s]*$/;

    if (!basics.name) newErrors.name = 'Name is required.';
    else if (basics.name.length < 4) newErrors.name = 'Name must be at least 4 characters.';
    else if (!englishRegex.test(basics.name)) newErrors.name = 'Name can only contain English letters and numbers.';

    if (!basics.symbol) newErrors.symbol = 'Symbol is required.';
    else if (basics.symbol.length < 4) newErrors.symbol = 'Symbol must be at least 4 characters.';
    else if (!englishRegex.test(basics.symbol)) newErrors.symbol = 'Symbol can only contain English letters and numbers.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    updateFormData('basics', { [e.target.id]: e.target.value });
  };
  
  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };
  
  useEffect(() => {
    validate(); // Real-time validation
  }, [basics]);

  return (
    <GlassCard>
      <h2 className="text-2xl font-semibold text-white mb-6">Basics</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
          <input type="text" id="name" value={basics.name} onChange={handleChange} placeholder="The name of your vault." className={`mt-1 block w-full px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-indigo-500'}`} />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300">Symbol</label>
          <input type="text" id="symbol" value={basics.symbol} onChange={handleChange} placeholder="The symbol of the tokenized shares of your vault." className={`mt-1 block w-full px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 transition ${errors.symbol ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-indigo-500'}`} />
          {errors.symbol && <p className="mt-1 text-xs text-red-400">{errors.symbol}</p>}
        </div>
        <div>
          <label htmlFor="denominationAsset" className="block text-sm font-medium text-gray-300">Denomination Asset</label>
          <select id="denominationAsset" value={basics.denominationAsset} onChange={handleChange} className="mt-1 block w-full pl-4 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
            <option>USDT</option>
            <option>USDC</option>
            <option>WETH</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">The denomination asset is the asset in which depositors deposit into your vault and in which the vault's share price and the performance are measured.</p>
        </div>
      </div>
      <FormNavigation onBack={prevStep} onNext={handleNext} disabled={Object.keys(errors).length > 0} />
    </GlassCard>
  );
};

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

const Step8_Review = () => {
  const { formData, prevStep } = useCreation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const { basics, fees, deposits, sharesTransferability, redemptions } = formData;

  const handleCreateVault = async () => {
    if (!termsAccepted || isCreating) return;

    setIsCreating(true);
    setError('');
    
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet.");
      }

      // 步驟四：將 UI 與合約服務連接
      // 1. 獲取簽名者 (Signer)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // It's good practice to request accounts again here to ensure connection.
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // 2. 呼叫服務
      const result = await contractService.createFund(signer, formData);

      // 4. 顯示結果
      alert(`Fund created successfully!\nComptroller: ${result.comptrollerProxy}\nVault: ${result.vaultProxy}`);

    } catch (err) {
      console.error("Fund creation failed:", err);
      const errorMessage = err.message || "An unknown error occurred.";
      setError(errorMessage);
      alert(`Fund creation failed: ${errorMessage}`);
    } finally {
      // 3. 處理 UI 狀態
      setIsCreating(false);
    }
  };
  
  const SummaryItem = ({ label, value, children }) => (
      <div className="flex justify-between py-3 border-b border-gray-700 last:border-b-0">
          <span className="text-gray-400">{label}</span>
          <span className="font-medium text-white text-right">{value || children}</span>
      </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold">Review</h1>
        <p className="text-gray-400 mt-2">Please review the vault configuration carefully before creating.<br/>All configuration settings are permanent (except where indicated).</p>
        
        <div className="mt-8 space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Vault Basics</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Vault Name" value={basics.name} />
                    <SummaryItem label="Vault Symbol" value={basics.symbol} />
                    <SummaryItem label="Denomination Asset" value={basics.denominationAsset} />
                </div>
            </div>
            
            <div>
                <h2 className="text-xl font-semibold mb-4">Fees</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Management Fee" value={fees.managementFee.enabled ? `${fees.managementFee.rate}%` : 'Disabled'} />
                    <SummaryItem label="Performance Fee" value={fees.performanceFee.enabled ? `${fees.performanceFee.rate}%` : 'Disabled'} />
                    <SummaryItem label="Exit Fee">
                        {fees.exitFee.enabled ? (
                            <div className="flex flex-col items-end">
                                <span>{fees.exitFee.inKindRate}% for in kind redemptions</span>
                                <span>{fees.exitFee.specificRate}% for specific assets redemptions</span>
                            </div>
                        ) : 'Disabled'}
                    </SummaryItem>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Policies</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Limit Wallets Permitted To Deposit" value={deposits.limitWalletsEnabled ? 'Configured' : 'No addresses configured for this policy'} />
                    <SummaryItem label="Restrict Wallets Permitted To Receive A Share Transfer" value={sharesTransferability.restricted ? 'Configured' : 'No addresses configured for this policy'} />
                    <SummaryItem label="Deposit Limits" value={deposits.depositLimitsEnabled ? `Minimum: ${deposits.minDeposit} ${basics.denominationAsset}` : 'Not configured'} />
                </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold mb-4">Other Settings</h2>
                <div className="bg-gray-800/60 rounded-lg px-6">
                    <SummaryItem label="Shares Action Timelock" value={`${redemptions.lockUpPeriod} hours`} />
                </div>
            </div>
        </div>

        <div className="mt-8">
            <label className="flex items-center space-x-3">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-500 text-indigo-600 rounded focus:ring-indigo-500"/>
                <span className="text-gray-300">I have read & agree to the <a href="#" className="text-indigo-400 hover:underline">Terms & Conditions</a>.</span>
            </label>
            {error && <p className="mt-2 text-sm text-red-400">Error: {error}</p>}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex justify-between items-center">
            <button onClick={prevStep} className="text-gray-300 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors border border-gray-600">Back</button>
            <button onClick={handleCreateVault} disabled={!termsAccepted || isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isCreating ? 'Creating...' : 'Create'}
            </button>
        </div>
    </div>
  );
};


// =======================================================================
// 5. 頁面容器與流程控制 (Page Containers & Flow Control)
// =======================================================================

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

const InvestorDashboard = () => {
    const { userFunds } = useApp();
    const hasFunds = userFunds.length > 0;

    return (
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col space-y-8">
                    <GlassCard className="flex flex-col h-full">
                        <h3 className="text-xl font-semibold text-white">投資與贖回</h3>
                        <p className="mt-2 text-sm text-gray-400">對您已加入的基金進行申購或贖回操作。</p>
                        <div className="flex-grow mt-4 space-y-4">
                        <div>
                            <label htmlFor="fund-select" className="block text-sm font-medium text-gray-300">選擇基金</label>
                            <select id="fund-select" disabled={!hasFunds} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {hasFunds ? (
                                userFunds.map(fund => <option key={fund.symbol}>{fund.name} ({fund.symbol})</option>)
                            ) : (
                                <option>無可用基金</option>
                            )}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button disabled={!hasFunds} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">申購</button>
                            <button disabled={!hasFunds} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">贖回</button>
                        </div>
                        </div>
                    </GlassCard>
                </div>
                <div className="lg:col-span-2">
                    <GlassCard className="h-full">
                        <h3 className="text-xl font-semibold text-white mb-4">我的基金績效總攬</h3>
                        <div className="space-y-4">
                        {hasFunds ? (
                            userFunds.map(fund => (
                                <div key={fund.symbol} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-gray-700/50 cursor-pointer">
                                    {/* Render fund data here */}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <p>此帳戶暫無購買基金</p>
                            </div>
                        )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
};

const ManagerDashboard = ({ onStartCreation }) => {
    return (
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md">
                <GlassCard className="flex flex-col h-full">
                    <div className="flex-shrink-0">
                        <h3 className="text-xl font-semibold text-white">創建與管理您的基金</h3>
                        <p className="mt-2 text-sm text-gray-400">透過我們引導式的流程，輕鬆設定並啟動一個完全符合您需求的私有化資產基金。</p>
                    </div>
                    <div className="flex-grow flex items-end mt-4">
                        <button onClick={onStartCreation} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300">開始創建 &rarr;</button>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
};

const RoleSelectionPage = ({ onSelectRole }) => {
    const { walletAddress, connectWallet } = useApp();
    const [showModal, setShowModal] = useState(false);

    const handleConnect = async () => {
        try {
            await connectWallet();
            setShowModal(true);
        } catch (error) {
            // Error is handled in context, but you could show a modal here too.
        }
    };

    const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)} title="連接成功">
                <p>投資人錢包已連接！</p>
            </Modal>
            <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-indigo-400">Fund Factory</h1>
                    <p className="text-lg text-gray-400 mt-2">在區塊鏈上建立、管理和投資基金。</p>
                    {walletAddress && (
                        <p className="text-md text-green-400 mt-4">
                            已連結到 {formatAddress(walletAddress)} 錢包
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
                        <h2 className="text-3xl font-semibold mb-3">投資人</h2>
                        <p className="text-gray-400 mb-6 flex-grow">探索基金、追蹤您的投資組合並增加您的資產。</p>
                        <button 
                            onClick={() => walletAddress ? onSelectRole('investor') : handleConnect()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {walletAddress ? '前往投資人儀表板' : '連接錢包'}
                        </button>
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
                        <h2 className="text-3xl font-semibold mb-3">基金經理人</h2>
                        <p className="text-gray-400 mb-6 flex-grow">創建您的基金、定義策略，並運用強大的工具來管理資產。</p>
                         <button 
                            onClick={() => walletAddress ? onSelectRole('manager') : handleConnect()}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {walletAddress ? '前往經理人儀表板' : '連接錢包'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};


// =======================================================================
// 6. 智能合約互動服務 (Contract Service)
// =======================================================================
import { contractService } from './services/contractService.js';


// =======================================================================
// 7. 主應用程式入口 (Main App Component)
// =======================================================================
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
