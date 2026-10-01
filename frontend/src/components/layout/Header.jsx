import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#10133B]/95 backdrop-blur-md border-b border-[#2C3078] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono text-[#94A3B8]">
          DATA_ISOLATION: <span className="text-emerald-400 font-semibold font-mono">ACTIVE (ZERO-TRUST)</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18194B] border border-[#2C3078] text-xs">
          <span className="text-[#94A3B8]">Operator:</span>
          <span className="font-semibold text-[#FCFCFC]">{user?.name}</span>
          <span className="font-mono text-[10px] text-[#009CD9]">({user?.role})</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline font-heading font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
