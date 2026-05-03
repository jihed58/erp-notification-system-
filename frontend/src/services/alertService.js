import api from './api';

// Récupérer toutes les alertes de l'utilisateur connecté
export const getAlerts = async () => {
  const response = await api.get('/alerts');
  return response.data;
};

// Créer une nouvelle alerte
export const createAlert = async (alertData) => {
  const response = await api.post('/alerts', alertData);
  return response.data;
};

// Modifier une alerte existante
export const updateAlert = async (id, alertData) => {
  const response = await api.put(`/alerts/${id}`, alertData);
  return response.data;
};

// Supprimer une alerte
export const deleteAlert = async (id) => {
  const response = await api.delete(`/alerts/${id}`);
  return response.data;
};
