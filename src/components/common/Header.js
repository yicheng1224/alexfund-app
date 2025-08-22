import React from 'react';

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

export default Header;
