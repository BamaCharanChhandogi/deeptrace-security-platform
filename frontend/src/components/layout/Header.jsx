import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-end sticky top-0 z-30 shadow-xs">
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-sans">Logout</span>
      </button>
    </header>
  );
}
