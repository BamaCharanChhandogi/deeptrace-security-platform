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
      let parsedMetadata = {};
      if (newEvent.metadataStr) {
        try {
          parsedMetadata = JSON.parse(newEvent.metadataStr);
        } catch {
          toast.error('Metadata must be valid JSON');
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
      await updateSecurityEventStatus(selectedEvent.id, {
        status: statusUpdate.status,
        note: statusUpdate.note
      });
      toast.success('Incident status updated');
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with DeepTrace Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="dt-hero-title text-2xl sm:text-[32px] sm:leading-[38px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2]" />
            </div>
            <span>Security Events</span>
          </h1>
          <p className="dt-body mt-1">
            Real-time feed of telemetry, attack attempts, and anomaly detections.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-dt-action bg-rose-600 hover:bg-rose-700 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Security Event</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, event type, or source..."
            className="dt-input pl-10 text-sm"
          />
        </form>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="dt-input text-sm"
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
          className="dt-input text-sm"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
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
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Incident / Description</th>
                  <th className="px-5 py-3.5">Event Type</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      setStatusUpdate({ status: ev.status, note: '' });
                    }}
                    className="hover:bg-slate-50/70 transition group cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <Badge value={ev.severity} variant={ev.severity} />
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="font-semibold text-slate-900 group-hover:text-[#009CD9] transition truncate">
                        {ev.description}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#009CD9] font-medium">
                      {ev.event_type}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {ev.source || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge value={ev.status} variant={ev.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDateTime(ev.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                          setStatusUpdate({ status: ev.status, note: '' });
                        }}
                        className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:text-[#009CD9] hover:border-[#009CD9] transition cursor-pointer"
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
        title="Security Event Details"
        maxWidth="max-w-xl"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">SEVERITY:</span>
                <Badge value={selectedEvent.severity} variant={selectedEvent.severity} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">STATUS:</span>
                <Badge value={selectedEvent.status} variant={selectedEvent.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Description</h4>
              <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Event Type</span>
                <span className="text-[#009CD9] font-mono font-semibold">{selectedEvent.event_type}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Telemetry Source</span>
                <span className="text-slate-800 font-medium">{selectedEvent.source || 'N/A'}</span>
              </div>
            </div>

            {selectedEvent.metadata && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Metadata Payload</h4>
                <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto">
                  {typeof selectedEvent.metadata === 'string'
                    ? selectedEvent.metadata
                    : JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Status Update Form (Admin / Manager) */}
            {canManage && (
              <form onSubmit={handleStatusUpdateSubmit} className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#009CD9]" />
                  <span>Update Incident Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="dt-input text-xs"
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
                    className="dt-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-dt-action w-full cursor-pointer"
                >
                  Save Status Change
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Log Security Event Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Security Event"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Type *
            </label>
            <input
              type="text"
              required
              value={newEvent.event_type}
              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
              placeholder="e.g. UNAUTHORIZED_ACCESS_ATTEMPT"
              className="dt-input text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Severity Level *
              </label>
              <select
                value={newEvent.severity}
                onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                className="dt-input text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Status
              </label>
              <select
                value={newEvent.status}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                className="dt-input text-sm"
              >
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source / System
            </label>
            <input
              type="text"
              value={newEvent.source}
              onChange={(e) => setNewEvent({ ...newEvent, source: e.target.value })}
              placeholder="e.g. Edge WAF / Host EDR"
              className="dt-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Incident Description *
            </label>
            <textarea
              required
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Describe the nature of the security alert..."
              className="dt-input text-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-dt-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-dt-action bg-rose-600 hover:bg-rose-700"
            >
              {isSubmitting ? 'Logging...' : 'Log Security Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
