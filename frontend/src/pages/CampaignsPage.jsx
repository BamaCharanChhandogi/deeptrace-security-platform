import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Edit,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  assignCampaignMember,
  removeCampaignMember,
  getUsers
} from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function CampaignsPage() {
  const { user, hasRole } = useAuth();

  // List State
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Selected Campaign Detail State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'DRAFT',
    start_date: '',
    end_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tenant users for member assignment dropdown
  const [tenantUsers, setTenantUsers] = useState([]);
  const [selectedUserIdToAssign, setSelectedUserIdToAssign] = useState('');

  const canManage = hasRole('ADMIN', 'MANAGER');
  const canDelete = hasRole('ADMIN');

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await getCampaigns(params);
      setCampaigns(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, statusFilter]);

  // Load tenant users for assignment
  useEffect(() => {
    if (canManage) {
      getUsers({ limit: 100 })
        .then((res) => setTenantUsers(res.data.data))
        .catch(() => {});
    }
  }, [canManage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  const openCampaignDetail = async (id) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const res = await getCampaignById(id);
      setSelectedCampaign(res.data.data);
    } catch (err) {
      toast.error('Failed to load campaign details');
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCampaign(formData);
      toast.success('Campaign created successfully');
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', status: 'DRAFT', start_date: '', end_date: '' });
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    if (!selectedCampaign) return;
    try {
      const res = await updateCampaign(selectedCampaign.id, { status: newStatus });
      setSelectedCampaign((prev) => ({ ...prev, status: res.data.data.status }));
      toast.success(`Status updated to ${newStatus}`);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
      setIsDetailOpen(false);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete campaign');
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!selectedUserIdToAssign || !selectedCampaign) return;
    try {
      await assignCampaignMember(selectedCampaign.id, selectedUserIdToAssign);
      toast.success('Member assigned to campaign');
      setSelectedUserIdToAssign('');
      // Reload details
      const res = await getCampaignById(selectedCampaign.id);
      setSelectedCampaign(res.data.data);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to assign member');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!selectedCampaign) return;
    try {
      await removeCampaignMember(selectedCampaign.id, memberUserId);
      toast.success('Member removed');
      const res = await getCampaignById(selectedCampaign.id);
      setSelectedCampaign(res.data.data);
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  // State machine helper for valid next transitions
  const getNextPossibleStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'DRAFT':
        return ['ACTIVE', 'CANCELLED'];
      case 'ACTIVE':
        return ['COMPLETED', 'CANCELLED'];
      default:
        return []; // COMPLETED & CANCELLED are terminal
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with DeepTrace Hero Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#2C3078]">
        <div>
          <h1 className="dt-hero-title text-2xl sm:text-[39px] sm:leading-[42px] flex items-center gap-3">
            <Target className="w-8 h-8 text-[#009CD9]" />
            <span>Campaign Management</span>
          </h1>
          <p className="dt-body mt-1">
            Organize, execute, and monitor organization-wide security exercises and drills.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-dt-action self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name or description..."
            className="dt-input pl-10 text-sm"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="dt-input w-full md:w-48 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="dt-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            message="No campaigns match your search query or filter selection."
            icon={Target}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Campaign Name</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Team Assigned</th>
                  <th className="px-5 py-3">Created By</th>
                  <th className="px-5 py-3">Created Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {campaigns.map((camp) => (
                  <tr
                    key={camp.id}
                    className="hover:bg-slate-900/40 transition group cursor-pointer"
                    onClick={() => openCampaignDetail(camp.id)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {camp.description || 'No description provided'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge value={camp.status} variant={camp.status} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {camp.member_count || 0} members
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {camp.creator_name || 'System'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatDate(camp.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCampaignDetail(camp.id);
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

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Security Campaign"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Q4 Executive Spear-Phishing Drill"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of objectives, attack vector, or remediation steps..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Campaign Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedCampaign?.name || 'Campaign Details'}
        maxWidth="max-w-2xl"
      >
        {isDetailLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : selectedCampaign ? (
          <div className="space-y-5 text-xs">
            {/* Overview & Status Progression */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Current Lifecycle</span>
                <Badge value={selectedCampaign.status} variant={selectedCampaign.status} />
              </div>

              {canManage && (
                <div>
                  <div className="text-[11px] text-slate-400 mb-2">Available State Transitions:</div>
                  <div className="flex flex-wrap gap-2">
                    {getNextPossibleStatuses(selectedCampaign.status).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusTransition(nextStatus)}
                        className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 font-mono text-[11px] flex items-center gap-1 transition"
                      >
                        <span>Transition to {nextStatus}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                    {getNextPossibleStatuses(selectedCampaign.status).length === 0 && (
                      <span className="text-slate-500 italic text-[11px]">
                        Campaign is in a terminal state ({selectedCampaign.status}) and cannot transition further.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Metadata */}
            <div>
              <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Description</h4>
              <p className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 text-slate-300">
                {selectedCampaign.description || 'No description entered.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Start Date</span>
                <span className="text-slate-200">{formatDate(selectedCampaign.start_date)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">End Date</span>
                <span className="text-slate-200">{formatDate(selectedCampaign.end_date)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Lead Creator</span>
                <span className="text-slate-200">{selectedCampaign.creator_name || 'System'}</span>
              </div>
            </div>

            {/* Assigned Team Members Section */}
            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Assigned Personnel ({selectedCampaign.members?.length || 0})</span>
                </h4>
              </div>

              {/* Assign Form (Admin / Manager) */}
              {canManage && (
                <form onSubmit={handleAssignMember} className="flex gap-2 mb-3">
                  <select
                    value={selectedUserIdToAssign}
                    onChange={(e) => setSelectedUserIdToAssign(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select team member to assign...</option>
                    {tenantUsers
                      .filter((u) => !selectedCampaign.members?.some((m) => m.id === u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) — [{u.role}]
                        </option>
                      ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!selectedUserIdToAssign}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs transition flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedCampaign.members?.length > 0 ? (
                  selectedCampaign.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80"
                    >
                      <div>
                        <span className="font-medium text-slate-200">{member.name}</span>{' '}
                        <span className="text-[11px] text-slate-400 font-mono">({member.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge value={member.role} variant={member.role} size="xs" />
                        {canManage && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Remove from campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic py-2">No team members assigned yet.</p>
                )}
              </div>
            </div>

            {/* Admin Delete Action */}
            {canDelete && (
              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">Admin Action: Permanent Deletion</span>
                <button
                  onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Campaign</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
