import api from './api';

/**
 * Generic function — works for any module and targetType.
 * Uses the shared api instance which auto-attaches the JWT token.
 */
export const getERPTargets = async (module, targetType) => {
  const res = await api.get(`/erp/targets?module=${module}&targetType=${targetType}`);
  return res.data;
};
