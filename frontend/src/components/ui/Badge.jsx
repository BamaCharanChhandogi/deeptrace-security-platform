import React from 'react';

const VARIANTS = {
  // Roles
  ADMIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MANAGER: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  USER: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',

  // Campaign Statuses
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',

  // Event Severities
  CRITICAL: 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold',
  HIGH: 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold',
  MEDIUM: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
  LOW: 'bg-blue-500/15 text-blue-400 border-blue-500/40',

  // Event Statuses
  OPEN: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  INVESTIGATING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  DISMISSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',

  // General
  default: 'bg-slate-800 text-slate-300 border-slate-700'
};

export default function Badge({ value, variant, size = 'sm', className = '' }) {
  const selectedVariant = VARIANTS[variant || value] || VARIANTS.default;
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-wide ${sizeClasses} ${selectedVariant} ${className}`}
    >
      {value}
    </span>
  );
}
