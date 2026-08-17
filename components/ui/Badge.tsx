'use client';

import React from 'react';

export type BadgeVariant = 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs font-semibold',
  md: 'px-2.5 py-1 text-xs font-bold',
  lg: 'px-3 py-1.5 text-sm font-bold',
};

export const Badge: React.FC<BadgeProps> = React.memo(({
  children,
  variant = 'indigo',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
