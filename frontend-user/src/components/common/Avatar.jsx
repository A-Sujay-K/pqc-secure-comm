import React from 'react';
import { getInitials } from '../../utils/formatters';

const Avatar = ({ name, color = '#7c3aed', isOnline = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className="relative inline-block">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shadow-lg`}
        style={{ backgroundColor: color }}
      >
        {getInitials(name)}
      </div>
      {isOnline !== null && (
        <span 
          className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-dark-bg ${isOnline ? 'bg-accent-emerald animate-pulse' : 'bg-gray-500'}`}
        />
      )}
    </div>
  );
};

export default Avatar;
