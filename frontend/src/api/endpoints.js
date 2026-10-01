import apiClient from './client';

// Auth
export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const logout = () => apiClient.post('/auth/logout');
export const getMe = () => apiClient.get('/auth/me');

// Dashboard
export const getDashboardStats = () => apiClient.get('/dashboard/stats');

// Campaigns
export const getCampaigns = (params) => apiClient.get('/campaigns', { params });
export const getCampaignById = (id) => apiClient.get(`/campaigns/${id}`);
export const createCampaign = (data) => apiClient.post('/campaigns', data);
export const updateCampaign = (id, data) => apiClient.patch(`/campaigns/${id}`, data);
export const deleteCampaign = (id) => apiClient.delete(`/campaigns/${id}`);
export const getCampaignMembers = (id) => apiClient.get(`/campaigns/${id}/members`);
export const assignCampaignMember = (id, userId) => apiClient.post(`/campaigns/${id}/members`, { userId });
export const removeCampaignMember = (id, userId) => apiClient.delete(`/campaigns/${id}/members/${userId}`);

// Security Events
export const getSecurityEvents = (params) => apiClient.get('/security-events', { params });
export const getSecurityEventById = (id) => apiClient.get(`/security-events/${id}`);
export const createSecurityEvent = (data) => apiClient.post('/security-events', data);
export const updateSecurityEventStatus = (id, data) => apiClient.patch(`/security-events/${id}`, data);

// Audit Logs (Admin only)
export const getAuditLogs = (params) => apiClient.get('/audit-logs', { params });

// Users
export const getUsers = (params) => apiClient.get('/users', { params });
export const getUserById = (id) => apiClient.get(`/users/${id}`);
export const createUser = (data) => apiClient.post('/users', data);
export const updateUser = (id, data) => apiClient.patch(`/users/${id}`, data);
