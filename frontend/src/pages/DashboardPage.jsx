import React, { useEffect, useState } from 'react';
import {
  Users,
  Target,
  ShieldAlert,
  AlertTriangle,
  Activity,
  RefreshCw,
  FolderKanban
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
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner with DeepTrace Hero Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="dt-hero-title text-2xl sm:text-[32px] sm:leading-[38px] flex flex-wrap items-center gap-3">
            <span>Security Command Center</span>
            <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-[#009CD9] border border-sky-200 font-semibold font-sans">
              {user?.tenantName}
            </span>
          </h1>
          <p className="dt-body mt-1.5">
            Real-time security posture, active campaigns, and audit activity for your organization.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="btn-dt-quote flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Campaigns"
          value={stats?.campaigns?.active || 0}
          subtitle={`${stats?.campaigns?.total || 0} total campaigns`}
          icon={FolderKanban}
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
          title="Tenant Personnel"
          value={stats?.users?.total || 0}
          subtitle="Active team members"
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Second Row: Event Severity Breakdown & Campaign Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Matrix */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-base text-[#18194B] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#009CD9]">
                <ShieldAlert className="w-4 h-4 stroke-[2]" />
              </div>
              <span>Event Severity Breakdown</span>
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { level: 'CRITICAL', count: stats?.events?.bySeverity?.CRITICAL || 0, color: 'bg-rose-500' },
              { level: 'HIGH', count: stats?.events?.bySeverity?.HIGH || 0, color: 'bg-amber-500' },
              { level: 'MEDIUM', count: stats?.events?.bySeverity?.MEDIUM || 0, color: 'bg-yellow-500' },
              { level: 'LOW', count: stats?.events?.bySeverity?.LOW || 0, color: 'bg-blue-500' }
            ].map((item) => (
              <div key={item.level} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-slate-700 font-semibold">{item.level}</span>
                </div>
                <span className="font-heading font-bold text-sm text-[#18194B]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-base text-[#18194B] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#009CD9]">
                <Target className="w-4 h-4 stroke-[2]" />
              </div>
              <span>Campaign Status Breakdown</span>
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { status: 'ACTIVE', count: stats?.campaigns?.active || 0, variant: 'ACTIVE' },
              { status: 'DRAFT', count: stats?.campaigns?.draft || 0, variant: 'DRAFT' },
              { status: 'COMPLETED', count: stats?.campaigns?.completed || 0, variant: 'COMPLETED' },
              { status: 'CANCELLED', count: stats?.campaigns?.cancelled || 0, variant: 'CANCELLED' }
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
                <Badge value={item.status} variant={item.variant} size="sm" />
                <span className="font-heading font-bold text-sm text-[#18194B]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-base text-[#18194B] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#009CD9]">
                <Activity className="w-4 h-4 stroke-[2]" />
              </div>
              <span>Recent Audit Activity</span>
            </h3>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[270px] pr-1">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#009CD9] font-semibold truncate max-w-[170px]">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatTimeAgo(log.created_at)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    by <span className="text-slate-800 font-medium">{log.actor_name || 'System'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No recent activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
