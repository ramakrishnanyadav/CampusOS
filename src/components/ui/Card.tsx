import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'borderless' | 'glass' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'borderless',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const base = 'rounded-[24px] p-6 transition-all duration-300';
  const styles = {
    borderless: 'borderless-card bg-white border border-slate-200/80 shadow-sm',
    glass: 'glass-panel bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg',
    outline: 'bg-white border border-slate-200 shadow-sm',
  };

  const hoverClass = hoverEffect ? 'hover:-translate-y-1 hover:shadow-xl hover:border-purple-200' : '';

  return (
    <div className={`${base} ${styles[variant]} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
