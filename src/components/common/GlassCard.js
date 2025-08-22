import React from 'react';

const GlassCard = ({ children, className = '' }) => <div className={`p-6 sm:p-8 rounded-2xl shadow-lg bg-gray-800/60 backdrop-filter backdrop-blur-xl border border-white/10 ${className}`}>{children}</div>;

export default GlassCard;
