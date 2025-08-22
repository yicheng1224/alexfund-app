import React from 'react';
import { useApp } from '../../context/AppContext';
import GlassCard from '../common/GlassCard';

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

export default InvestorDashboard;
