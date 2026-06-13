import React from 'react';

export const Spinner = ({ size = 'md', variant = 'blue', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const borderColors = {
    blue: 'border-neonBlue/20 border-t-neonBlue',
    purple: 'border-neonPurple/20 border-t-neonPurple',
    pink: 'border-cyberPink/20 border-t-cyberPink',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizes[size]} ${borderColors[variant]}`}
      ></div>
    </div>
  );
};

export const PageSpinner = ({ message = "LOADING SYSTEMS..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Spinner size="lg" variant="blue" />
      <span className="font-orbitron text-xs text-neonBlue animate-pulse tracking-widest">{message}</span>
    </div>
  );
};
