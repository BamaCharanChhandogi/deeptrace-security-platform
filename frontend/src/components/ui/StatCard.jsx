import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) {
  // Soft, human pastel tints (exact pattern from deeptrace.in website features)
  const colorMap = {
    cyan: 'text-[#009CD9] bg-sky-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50'
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.cyan}`}>
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-heading font-bold text-[#18194B] tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs text-emerald-600 font-medium">{trend}</span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
