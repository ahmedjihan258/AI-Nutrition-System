import React from 'react';

export const Card = ({ className = '', children, hover = false, variant = 'blue', ...props }) => {
  const borderColors = {
    blue: 'hover:border-neonBlue/40 focus:border-neonBlue/40',
    purple: 'hover:border-neonPurple/40 focus:border-neonPurple/40',
    pink: 'hover:border-cyberPink/40 focus:border-cyberPink/40',
    green: 'hover:border-neonGreen/40 focus:border-neonGreen/40',
  };

  return (
    <div
      className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 ${
        hover ? `hover:-translate-y-1 hover:shadow-lg ${borderColors[variant] || ''}` : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 pb-4 border-b border-white/5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className = '', children, ...props }) => {
  return (
    <h3
      className={`text-lg font-orbitron font-bold tracking-wider text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className = '', children, ...props }) => {
  return (
    <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 pt-0 border-t border-white/5 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
};
