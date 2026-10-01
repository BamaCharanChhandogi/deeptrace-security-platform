import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  ShieldAlert,
  FileText,
  Users,
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
    <aside className="w-64 bg-[#18194B] border-r border-[#23266A] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#23266A]">
        <div className="flex items-center gap-3">
          {/* DeepTrace Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-6 h-6 text-[#009CD9]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.14-2.73 8.03-6 9.07-3.27-1.04-6-4.93-6-9.07V6.43l6-2.25z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-heading font-bold text-sm tracking-wider text-white uppercase">
              Deep Trace
            </h1>
            <span className="text-[10px] text-[#009CD9] font-mono tracking-widest font-semibold block">
              CYBERNETICS
            </span>
          </div>
        </div>

        {/* Tenant Indicator */}
        <div className="mt-4 p-3 rounded-xl bg-[#12133B] border border-[#2A2D75]">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#009CD9]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Active Tenant</span>
          </div>
          <div className="font-semibold text-xs text-white truncate">
            {user?.tenantName || 'Current Organization'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#009CD9] text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#23266A]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
            {item.adminOnly && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200">
                ADMIN
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#23266A] bg-[#12133B]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <Badge value={user?.role} variant={user?.role} size="xs" />
        </div>
      </div>
    </aside>
  );
}
