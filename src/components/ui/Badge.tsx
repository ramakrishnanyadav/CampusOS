import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'warning' | 'info' | 'success' | 'demo' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const styles = {
    critical: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    demo: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    purple: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
