import React from 'react';
import GlassCard from '../common/GlassCard';

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

export default ManagerDashboard;
