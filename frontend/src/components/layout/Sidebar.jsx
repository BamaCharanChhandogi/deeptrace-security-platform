import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  ShieldAlert,
  FileText,
  Users,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Campaigns', path: '/campaigns', icon: Target },
    { name: 'Security Events', path: '/events', icon: ShieldAlert },
    ...(user?.role === 'ADMIN'
      ? [{ name: 'Audit Logs', path: '/audit-logs', icon: FileText, adminOnly: true }]
      : []),
    { name: 'Users & Roles', path: '/users', icon: Users }
  ];

  return (
    <aside className="w-64 bg-[#0c1220] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider text-slate-100 uppercase">
              DeepTrace
            </h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest block">
              CYBERNETICS
            </span>
          </div>
        </div>

        {/* Tenant Indicator */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Tenant</span>
          </div>
          <div className="font-semibold text-xs text-slate-200 truncate">
            {user?.tenantName || 'Current Organization'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
            {item.adminOnly && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ADMIN
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <Badge value={user?.role} variant={user?.role} size="xs" />
        </div>
      </div>
    </aside>
  );
}
