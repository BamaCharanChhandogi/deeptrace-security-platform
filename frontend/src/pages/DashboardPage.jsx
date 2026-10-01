import React, { useEffect, useState } from 'react';
import {
  Users,
  Target,
  ShieldAlert,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { getDashboardStats } from '../api/endpoints';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatTimeAgo } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load tenant dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Security Command Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {user?.tenantName}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security posture, active campaigns, and audit activity for your organization.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campaigns"
          value={stats?.campaigns?.active || 0}
          subtitle={`${stats?.campaigns?.total || 0} total campaigns`}
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Critical Incidents"
          value={stats?.events?.criticalOpen || 0}
          subtitle="Action required immediately"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Open Events"
          value={stats?.events?.open || 0}
          subtitle={`${stats?.events?.total || 0} recorded events`}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Tenant Users"
          value={stats?.users?.total || 0}
          subtitle="Active team members"
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Second Row: Event Severity Breakdown & Campaign Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Matrix */}
        <div className="cyber-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Event Severity Breakdown
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { level: 'CRITICAL', count: stats?.events?.bySeverity?.CRITICAL || 0, color: 'bg-rose-500' },
              { level: 'HIGH', count: stats?.events?.bySeverity?.HIGH || 0, color: 'bg-amber-500' },
              { level: 'MEDIUM', count: stats?.events?.bySeverity?.MEDIUM || 0, color: 'bg-yellow-500' },
              { level: 'LOW', count: stats?.events?.bySeverity?.LOW || 0, color: 'bg-blue-500' }
            ].map((item) => (
              <div key={item.level} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs font-mono text-slate-300">{item.level}</span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-100">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Status Breakdown */}
        <div className="cyber-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Campaign Status Breakdown
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { status: 'ACTIVE', count: stats?.campaigns?.active || 0, variant: 'ACTIVE' },
              { status: 'DRAFT', count: stats?.campaigns?.draft || 0, variant: 'DRAFT' },
              { status: 'COMPLETED', count: stats?.campaigns?.completed || 0, variant: 'COMPLETED' },
              { status: 'CANCELLED', count: stats?.campaigns?.cancelled || 0, variant: 'CANCELLED' }
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <Badge value={item.status} variant={item.variant} size="xs" />
                <span className="text-xs font-bold font-mono text-slate-100">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity Feed */}
        <div className="cyber-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Recent Audit Activity
            </h3>
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-cyan-400 font-semibold truncate max-w-[170px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimeAgo(log.created_at)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    by <span className="text-slate-200">{log.actor_name || 'System'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No recent activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
