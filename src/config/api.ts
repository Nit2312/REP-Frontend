const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://rep-update-app.onrender.com/api'  // Render backend URL
  : 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig; 