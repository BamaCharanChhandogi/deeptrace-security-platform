import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  getSecurityEvents,
  createSecurityEvent,
  updateSecurityEventStatus
} from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function SecurityEventsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'MANAGER');

  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    severity: 'HIGH',
    status: 'OPEN',
    description: '',
    source: 'Edge WAF',
    metadataStr: '{"target": "auth-service"}'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Update state
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    note: ''
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getSecurityEvents(params);
      setEvents(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, severityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let parsedMetadata = null;
      if (newEvent.metadataStr) {
        try {
          parsedMetadata = JSON.parse(newEvent.metadataStr);
        } catch {
          toast.error('Invalid JSON in metadata field');
          setIsSubmitting(false);
          return;
        }
      }

      await createSecurityEvent({
        event_type: newEvent.event_type,
        severity: newEvent.severity,
        status: newEvent.status,
        description: newEvent.description,
        source: newEvent.source,
        metadata: parsedMetadata
      });

      toast.success('Security incident recorded');
      setIsCreateOpen(false);
      setNewEvent({
        event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'HIGH',
        status: 'OPEN',
        description: '',
        source: 'Edge WAF',
        metadataStr: '{"target": "auth-service"}'
      });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to record event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !statusUpdate.status) return;

    try {
      const res = await updateSecurityEventStatus(selectedEvent.id, {
        status: statusUpdate.status,
        note: statusUpdate.note
      });
      toast.success(`Event status updated to ${statusUpdate.status}`);
      setSelectedEvent(res.data.data);
      setStatusUpdate({ status: '', note: '' });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update event status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Security Incident & Event Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of telemetry, attack attempts, and anomaly detections.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Incident</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, event type, or source..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="cyber-panel rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No events matching criteria"
            message="No security incidents currently logged for these filter conditions."
            icon={ShieldAlert}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Incident / Description</th>
                  <th className="px-5 py-3">Event Type</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      setStatusUpdate({ status: ev.status, note: '' });
                    }}
                    className="hover:bg-slate-900/40 transition group cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <Badge value={ev.severity} variant={ev.severity} />
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition truncate">
                        {ev.description}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-cyan-400">
                      {ev.event_type}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {ev.source || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge value={ev.status} variant={ev.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(ev.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                          setStatusUpdate({ status: ev.status, note: '' });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition"
                      >
                        Inspect ➔
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

      {/* Inspect / Update Event Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Incident Forensics & Status"
        maxWidth="max-w-xl"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[10px]">SEVERITY:</span>
                <Badge value={selectedEvent.severity} variant={selectedEvent.severity} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[10px]">CURRENT STATUS:</span>
                <Badge value={selectedEvent.status} variant={selectedEvent.status} />
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Description</h4>
              <p className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Event Type</span>
                <span className="text-cyan-400 font-semibold">{selectedEvent.event_type}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Telemetry Source</span>
                <span className="text-slate-200">{selectedEvent.source || 'N/A'}</span>
              </div>
            </div>

            {selectedEvent.metadata && (
              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Metadata Payload</h4>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto">
                  {typeof selectedEvent.metadata === 'string'
                    ? selectedEvent.metadata
                    : JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Status Update Form (Admin / Manager) */}
            {canManage && (
              <form onSubmit={handleStatusUpdateSubmit} className="border-t border-slate-800 pt-4 space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Update Incident Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="OPEN">Mark as OPEN</option>
                    <option value="INVESTIGATING">Mark as INVESTIGATING</option>
                    <option value="RESOLVED">Mark as RESOLVED</option>
                    <option value="DISMISSED">Mark as DISMISSED</option>
                  </select>

                  <input
                    type="text"
                    value={statusUpdate.note}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                    placeholder="Add resolution or investigation note..."
                    className="py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition"
                >
                  Save Status Change
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Record Incident Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Security Incident"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Event Type *
            </label>
            <input
              type="text"
              required
              value={newEvent.event_type}
              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
              placeholder="e.g. UNAUTHORIZED_ACCESS_ATTEMPT"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Severity Level *
              </label>
              <select
                value={newEvent.severity}
                onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={newEvent.status}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Source / System
            </label>
            <input
              type="text"
              value={newEvent.source}
              onChange={(e) => setNewEvent({ ...newEvent, source: e.target.value })}
              placeholder="e.g. Edge WAF / Host EDR"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Incident Description *
            </label>
            <textarea
              required
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Describe the nature of the security alert..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
            >
              {isSubmitting ? 'Recording...' : 'Record Incident'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
