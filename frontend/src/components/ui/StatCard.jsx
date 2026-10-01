import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) {
  const colorMap = {
    cyan: 'text-[#009CD9] bg-[#009CD9]/10 border-[#009CD9]/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  };

  return (
    <div className="bg-[#18194B] p-5 rounded-xl border border-[#2C3078] transition-all hover:border-[#009CD9]/50 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] font-mono">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.cyan}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-heading font-bold text-[#FCFCFC]">{value}</span>
        {trend && (
          <span className="text-xs text-emerald-400 font-medium font-mono">{trend}</span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-[#94A3B8]">{subtitle}</p>
      )}
    </div>
  );
}
