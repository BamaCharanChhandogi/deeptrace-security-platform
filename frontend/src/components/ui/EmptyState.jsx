import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'No data matching your current filters.', icon: Icon = Inbox, action }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">{message}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
