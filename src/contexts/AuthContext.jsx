import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Проверяем локальное хранилище при инициализации
    const savedUser = localStorage.getItem('user');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    // ПРОВЕРЯЕМ, НЕ ИСТЕК ЛИ ТОКЕН ПРИ ЗАГРУЗКЕ
    if (expiresAt && new Date(expiresAt) < new Date()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expires_at');
      return null;
    }
    
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(() => {
    return localStorage.getItem('token_expires_at');
  });

  // АВТОМАТИЧЕСКАЯ ПРОВЕРКА ИСТЕЧЕНИЯ ТОКЕНА
  useEffect(() => {
    checkAuth();
    
    // Проверяем каждую минуту, не истек ли токен
    const expirationCheckInterval = setInterval(() => {
      if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
        console.log('Token expired automatically, logging out...');
        handleCleanLogout();
        window.location.href = '/login?reason=expired';
      }
    }, 60000); // 1 минута
    
    return () => clearInterval(expirationCheckInterval);
  }, [tokenExpiresAt]);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.getUser();
      if (result.success && result.user) {
        setUser(result.user);
        if (result.token_expires_at) {
          localStorage.setItem('token_expires_at', result.token_expires_at);
          setTokenExpiresAt(result.token_expires_at);
        }
      } else {
        handleCleanLogout();
      }
    } catch (error) {
      if (error.expired) {
        // Токен истек на сервере
        handleCleanLogout();
      } else {
        console.error('Auth check failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCleanLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');
    setUser(null);
    setTokenExpiresAt(null);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authAPI.login(credentials);
      
      if (result.success && result.token) {
        // СОХРАНЯЕМ ВСЕ ДАННЫЕ О ТОКЕНЕ
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        if (result.expires_at) {
          localStorage.setItem('token_expires_at', result.expires_at);
          setTokenExpiresAt(result.expires_at);
        }
        
        setUser(result.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: result.message || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'An error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleCleanLogout();
    }
  };

  // ПОЛЕЗНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ СО ВРЕМЕНЕМ
  const getTokenTimeLeft = useCallback(() => {
    if (!tokenExpiresAt) return 0;
    const expires = new Date(tokenExpiresAt);
    const now = new Date();
    return Math.max(0, Math.floor((expires - now) / 1000)); // секунды
  }, [tokenExpiresAt]);

  const tokenWillExpireSoon = useCallback(() => {
    const timeLeft = getTokenTimeLeft();
    return timeLeft > 0 && timeLeft < 300; // 5 минут
  }, [getTokenTimeLeft]);

  const formatTimeLeft = useCallback(() => {
    const timeLeft = getTokenTimeLeft();
    if (timeLeft <= 0) return 'Истек';
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds}с`;
    } else {
      return `${seconds}с`;
    }
  }, [getTokenTimeLeft]);

  const hasPermission = useCallback((permission) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const canManageUsers = useCallback(() => {
    return user?.role === 'superadmin' || user?.role === 'admin';
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    tokenExpiresAt,
    getTokenTimeLeft,
    tokenWillExpireSoon,
    formatTimeLeft,
    handleCleanLogout, // Для принудительного выхода
    hasPermission,
    canManageUsers,
    userRole: user?.role,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isManager: user?.role === 'manager' || user?.role === 'admin' || user?.role === 'superadmin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};