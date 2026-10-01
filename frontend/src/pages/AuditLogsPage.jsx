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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographically sealed and timestamped log of all state modifications across your organization.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono self-start sm:self-auto">
          RESTRICTED: ADMIN ONLY
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, entity type, actor name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-56 py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
      <div className="cyber-panel rounded-xl border border-slate-800 overflow-hidden">
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
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Actor / Principal</th>
                  <th className="px-5 py-3">Entity Type</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-900/40 transition group cursor-pointer"
                  >
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-cyan-400">{log.action}</span>
                    </td>
                    <td className="px-5 py-3 font-sans">
                      <div className="text-slate-200 font-medium">{log.actor_name || 'System / Unauth'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actor_email || '—'}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {log.entity_type ? `${log.entity_type}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[10px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition"
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
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ACTION</span>
                <span className="text-cyan-400 font-semibold">{selectedLog.action}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
                <span className="text-slate-300">{formatDateTime(selectedLog.created_at)}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ACTOR</span>
                <span className="text-slate-300 font-sans">{selectedLog.actor_name} ({selectedLog.actor_email})</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
                <span className="text-slate-300">{selectedLog.ip_address || 'Unknown'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase mb-1">Raw Mutation Payload</span>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800 overflow-x-auto text-[11px]">
                {typeof selectedLog.details === 'string'
                  ? selectedLog.details
                  : JSON.stringify(selectedLog.details, null, 2) || '{}'}
              </pre>
            </div>

            {selectedLog.user_agent && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase mb-1">User Agent</span>
                <p className="text-[10px] text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
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
