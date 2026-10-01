import React, { useEffect, useState } from 'react';
import {
  Users,
  Target,
  ShieldAlert,
  AlertTriangle,
  Activity,
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
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner with DeepTrace Hero Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#2C3078]">
        <div>
          <h1 className="dt-hero-title text-2xl sm:text-[39px] sm:leading-[42px] flex flex-wrap items-center gap-3">
            <span>Security Command Center</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#009CD9]/15 text-[#009CD9] border border-[#009CD9]/30 font-mono font-semibold">
              {user?.tenantName}
            </span>
          </h1>
          <p className="dt-body mt-2">
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
        <div className="dt-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="dt-card-title flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#009CD9]/15 flex items-center justify-center text-[#009CD9]">
                <ShieldAlert className="w-4 h-4" />
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
              <div key={item.level} className="flex items-center justify-between p-3 rounded-lg bg-[#10133B] border border-[#2C3078]">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="font-mono text-xs text-[#FCFCFC] font-medium">{item.level}</span>
                </div>
                <span className="font-heading font-bold text-sm text-[#FCFCFC]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Status Breakdown */}
        <div className="dt-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="dt-card-title flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#009CD9]/15 flex items-center justify-center text-[#009CD9]">
                <Target className="w-4 h-4" />
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
              <div key={item.status} className="flex items-center justify-between p-3 rounded-lg bg-[#10133B] border border-[#2C3078]">
                <Badge value={item.status} variant={item.variant} size="sm" />
                <span className="font-heading font-bold text-sm text-[#FCFCFC]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity Feed */}
        <div className="dt-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="dt-card-title flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#009CD9]/15 flex items-center justify-center text-[#009CD9]">
                <Activity className="w-4 h-4" />
              </div>
              <span>Recent Audit Activity</span>
            </h3>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[270px] pr-1">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-[#10133B] border border-[#2C3078] text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#009CD9] font-semibold truncate max-w-[170px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      {formatTimeAgo(log.created_at)}
                    </span>
                  </div>
                  <div className="text-xs text-[#94A3B8] truncate">
                    by <span className="text-[#FCFCFC] font-medium">{log.actor_name || 'System'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="dt-body text-center py-10">No recent activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
