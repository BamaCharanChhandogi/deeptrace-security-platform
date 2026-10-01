import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';

export default function Header() {
  const { user, logout } = useAuth();
  const cleanName = user?.name ? user.name.replace(/\s*\([^)]*\)/, '') : 'User';
  const initial = cleanName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Organization:</span>
        <span className="text-xs font-semibold text-[#18194B] px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
          {user?.tenantName || 'Current Organization'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Clean, professional user identity pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="w-6 h-6 rounded-full bg-[#18194B] text-white flex items-center justify-center text-[11px] font-bold">
            {initial}
          </div>
          <span className="font-semibold text-slate-800">{cleanName}</span>
          <Badge value={user?.role} variant={user?.role} size="xs" />
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-sans">Logout</span>
        </button>
      </div>
    </header>
  );
}
