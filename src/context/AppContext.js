import React, { useState, createContext, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [network, setNetwork] = useState('Sepolia');
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

    const value = { network, setNetwork, currency, setCurrency, walletAddress, setWalletAddress, connectWallet, userFunds, setUserFunds };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
