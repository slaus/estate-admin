import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://estate.test/backend/public/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response?.status === 401) {
      // ЕСЛИ ТОКЕН ИСТЕК, ОЧИЩАЕМ ХРАНИЛИЩЕ
      const errorData = error.response?.data;
      
      if (errorData?.expired) {
        // Сервер явно сказал, что токен истек
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expires_at');
        
        // Редирект на логин с причиной
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?reason=expired';
        }
      } else {
        // Другая 401 ошибка
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expires_at');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default api;