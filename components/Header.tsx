import React from 'react';
import { BrainCircuitIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-navy-950/80 sticky top-0 backdrop-blur-lg z-10 border-b border-navy-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-center h-16">
          <BrainCircuitIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="ml-3 text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 text-transparent bg-clip-text">
            Elite Science Responder
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;