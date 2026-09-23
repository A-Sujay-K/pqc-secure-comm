import React from 'react';

const Toggle = ({ checked, onChange, label, className = '' }) => {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      {label && <span className="mr-3 text-sm font-medium text-gray-300">{label}</span>}
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-14 h-8 rounded-full transition-all duration-300 ${checked ? 'bg-accent-gold/20 border border-accent-gold/50 shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'bg-white/10 border border-white/20'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${checked ? 'transform translate-x-6 bg-accent-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]' : ''}`}>
          {checked && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
        </div>
      </div>
    </label>
  );
};

export default Toggle;
