import api from './api';

export const getHistory = async (archived = false) => {
  const response = await api.get(`/notifications?archived=${archived}`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const archiveNotification = async (id) => {
  const response = await api.put(`/notifications/${id}/archive`);
  return response.data;
};

export const simulateAlert = async (alertRuleId) => {
  const response = await api.post('/notifications/simulate', { alertRuleId });
  return response.data;
};
