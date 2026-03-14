import axios from 'axios';
// Créer une instance axios avec l'URL de base du backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
// Intercepteur : ajoute automatiquement le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;