import React from 'react';

export const Input = React.forwardRef(({
  className = '',
  label,
  type = 'text',
  error,
  variant = 'blue', // 'blue' or 'purple'
  ...props
}, ref) => {
  const focusRings = {
    blue: 'focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/40',
    purple: 'focus:border-neonPurple focus:ring-1 focus:ring-neonPurple/40',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-orbitron font-semibold tracking-wider text-slate-300 mb-2 uppercase">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={`w-full bg-[#12122c]/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-300 outline-none ${
          focusRings[variant] || focusRings.blue
        } ${error ? 'border-cyberPink focus:border-cyberPink focus:ring-cyberPink/40' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-cyberPink font-medium mt-1.5 uppercase font-orbitron tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
