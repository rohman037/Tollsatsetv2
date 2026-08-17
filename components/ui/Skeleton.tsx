'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const TabSkeletonLoader: React.FC<{ title?: string }> = ({ title }) => (
  <div className="space-y-6 animate-pulse p-2">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
        <div className="h-3.5 w-72 bg-slate-100 rounded"></div>
      </div>
      <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-28 bg-slate-100 rounded-2xl border border-slate-200/60 p-4"></div>
      <div className="h-28 bg-slate-100 rounded-2xl border border-slate-200/60 p-4"></div>
      <div className="h-28 bg-slate-100 rounded-2xl border border-slate-200/60 p-4"></div>
    </div>
    <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200/60 p-6"></div>
  </div>
);
