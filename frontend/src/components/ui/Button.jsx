import React from 'react';

export const Button = ({
  className = '',
  children,
  variant = 'blue', // 'blue', 'purple', 'pink', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-orbitron font-medium tracking-wider rounded-lg transition-all duration-300 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    blue: 'bg-neonBlue text-slate-950 shadow-neon-blue hover:bg-[#00d6e6] focus:ring-neonBlue/50',
    purple: 'bg-neonPurple text-white shadow-neon-purple hover:bg-[#a500df] focus:ring-neonPurple/50',
    pink: 'bg-cyberPink text-white shadow-[0_0_12px_rgba(255,0,127,0.4)] hover:bg-[#e60072] focus:ring-cyberPink/50',
    outline: 'border border-neonBlue text-neonBlue bg-transparent hover:bg-neonBlue/10 focus:ring-neonBlue/30',
    outlinePurple: 'border border-neonPurple text-neonPurple bg-transparent hover:bg-neonPurple/10 focus:ring-neonPurple/30',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5 bg-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant] || variants.blue} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PROCESSING...
        </>
      ) : children}
    </button>
  );
};
