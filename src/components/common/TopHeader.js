import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import useClickOutside from '../../hooks/useClickOutside';

import EthereumIcon from '../icons/EthereumIcon';
import ArbitrumIcon from '../icons/ArbitrumIcon';
import BaseIcon from '../icons/BaseIcon';
import PolygonIcon from '../icons/PolygonIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

const TopHeader = () => {
    const { network, setNetwork, currency, setCurrency, walletAddress } = useApp();
    const networks = { Ethereum: <EthereumIcon />, Sepolia: <EthereumIcon />, Arbitrum: <ArbitrumIcon />, Base: <BaseIcon />, Polygon: <PolygonIcon /> };
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

export default TopHeader;
