import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Alert = ({ children, variant = 'info', className = '' }) => {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-neonGreen/10 border-neonGreen/30 text-neonGreen',
    error: 'bg-cyberPink/10 border-cyberPink/30 text-cyberPink',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };

  const icons = {
    info: <Info className="w-5 h-5 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 shrink-0" />,
  };

  return (
    <div
      className={`border rounded-lg p-4 flex items-start gap-3 text-sm backdrop-blur-sm ${styles[variant]} ${className}`}
      role="alert"
    >
      {icons[variant]}
      <div className="flex-1 font-sans font-medium">{children}</div>
    </div>
  );
};
