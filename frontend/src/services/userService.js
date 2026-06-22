import api from './api';

// List all users (ERP Manager only)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// List pending users (ERP Manager only)
export const getPendingUsers = async () => {
  const response = await api.get('/users/pending');
  return response.data;
};

// Approve a pending user with role and optional department
export const approveUser = async (id, { role, department }) => {
  const response = await api.put(`/users/${id}/approve`, { role, department });
  return response.data;
};

// Update a user's role
export const updateUserRole = async (id, { role, department }) => {
  const response = await api.put(`/users/${id}/role`, { role, department });
  return response.data;
};

// Suspend a user account
export const suspendUser = async (id) => {
  const response = await api.put(`/users/${id}/suspend`);
  return response.data;
};

// Reactivate a suspended user
export const reactivateUser = async (id) => {
  const response = await api.put(`/users/${id}/reactivate`);
  return response.data;
};

// Delete a user account
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get all users in the admin's department
export const getDepartmentUsers = async () => {
  const response = await api.get('/users/department');
  return response.data;
};

// Get alerts for a specific user
export const getUserAlerts = async (id) => {
  const response = await api.get(`/users/${id}/alerts`);
  return response.data;
};

// Get notifications for a specific user
export const getUserNotifications = async (id) => {
  const response = await api.get(`/users/${id}/notifications`);
  return response.data;
};

// Reset a user's password manually (ERP Manager only)
export const resetUserPassword = async (id, temporaryPassword) => {
  const response = await api.put(`/users/${id}/reset-password`, { temporaryPassword });
  return response.data;
};
