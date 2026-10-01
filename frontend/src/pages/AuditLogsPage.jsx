import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  UserCheck
} from 'lucide-react';
import { getAuditLogs } from '../api/endpoints';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal for JSON details inspection
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;

      const res = await getAuditLogs(params);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header with DeepTrace Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="dt-hero-title text-2xl sm:text-[32px] sm:leading-[38px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#009CD9] shrink-0">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="dt-body mt-1">
            Cryptographically sealed and timestamped log of all state modifications across your organization.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold self-start sm:self-auto">
          RESTRICTED: ADMIN ONLY
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, entity type, actor name or email..."
            className="dt-input pl-10 text-sm"
          />
        </form>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="dt-input w-full md:w-64 text-sm"
        >
          <option value="">All Actions</option>
          <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
          <option value="LOGIN_FAILED">LOGIN_FAILED</option>
          <option value="CAMPAIGN_CREATED">CAMPAIGN_CREATED</option>
          <option value="CAMPAIGN_UPDATED">CAMPAIGN_UPDATED</option>
          <option value="CAMPAIGN_STATUS_CHANGED">CAMPAIGN_STATUS_CHANGED</option>
          <option value="CAMPAIGN_DELETED">CAMPAIGN_DELETED</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="USER_UPDATED">USER_UPDATED</option>
          <option value="SECURITY_EVENT_CREATED">SECURITY_EVENT_CREATED</option>
          <option value="SECURITY_EVENT_STATUS_CHANGED">SECURITY_EVENT_STATUS_CHANGED</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No audit logs recorded"
            message="No actions match the selected filter parameters."
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Actor / Principal</th>
                  <th className="px-5 py-3.5">Entity Type</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/70 transition group cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-[#009CD9] text-xs">{log.action}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-900 font-semibold">{log.actor_name || 'System / Unauth'}</div>
                      <div className="text-[11px] text-slate-500">{log.actor_email || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {log.entity_type ? `${log.entity_type}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:text-[#009CD9] hover:border-[#009CD9] transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Inspect Audit Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">ACTION</span>
                <span className="text-[#009CD9] font-mono font-semibold">{selectedLog.action}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">TIMESTAMP</span>
                <span className="text-slate-700 font-medium">{formatDateTime(selectedLog.created_at)}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">ACTOR</span>
                <span className="text-slate-800 font-medium">{selectedLog.actor_name} ({selectedLog.actor_email})</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">IP ADDRESS</span>
                <span className="text-slate-700 font-mono">{selectedLog.ip_address || 'Unknown'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">Raw Mutation Payload</span>
              <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800 overflow-x-auto">
                {typeof selectedLog.details === 'string'
                  ? selectedLog.details
                  : JSON.stringify(selectedLog.details, null, 2) || '{}'}
              </pre>
            </div>

            {selectedLog.user_agent && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">User Agent</span>
                <p className="text-[11px] text-slate-600 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedLog.user_agent}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
