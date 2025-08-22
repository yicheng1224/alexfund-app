import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';

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

export default RoleSelectionPage;
