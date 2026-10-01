import React from 'react';

const VARIANTS = {
  // Roles
  ADMIN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MANAGER: 'bg-amber-50 text-amber-700 border-amber-200',
  USER: 'bg-sky-50 text-sky-700 border-sky-200',

  // Campaign Statuses
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-sky-50 text-[#0084B8] border-sky-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Event Severities
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  HIGH: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
  MEDIUM: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  LOW: 'bg-blue-50 text-blue-700 border-blue-200',

  // Event Statuses
  OPEN: 'bg-rose-50 text-rose-700 border-rose-200',
  INVESTIGATING: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISMISSED: 'bg-slate-100 text-slate-600 border-slate-200',

  // General
  default: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function Badge({ value, variant, size = 'sm', className = '' }) {
  const selectedVariant = VARIANTS[variant || value] || VARIANTS.default;
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-wide ${sizeClasses} ${selectedVariant} ${className}`}
    >
      {value}
    </span>
  );
}
