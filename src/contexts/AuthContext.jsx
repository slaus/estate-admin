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

  useEffect(() => {
    checkAuth();
    
    const expirationCheckInterval = setInterval(() => {
      if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
        // console.log('Token expired automatically, logging out...');
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
        // console.log('=== CHECK AUTH SUCCESS ===');
        // console.log('User data from /user endpoint:', result.user);
        // console.log('Avatar from /user endpoint:', result.user?.avatar);
        
        // Обрабатываем avatar URL
        const userData = { ...result.user };
        
        // Убедимся что avatar обрабатывается
        if (userData.avatar && userData.avatar.startsWith('/') && !userData.avatar.startsWith('http')) {
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://estate-backend.test';
          userData.avatar = baseUrl + userData.avatar;
          // console.log('Processed avatar URL:', userData.avatar);
        } else if (!userData.avatar) {
          console.log('WARNING: avatar is missing in response!');
        }
        
        setUser(userData);
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (result.token_expires_at) {
          localStorage.setItem('token_expires_at', result.token_expires_at);
          setTokenExpiresAt(result.token_expires_at);
        }
      } else {
        console.log('Auth failed, cleaning up');
        handleCleanLogout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (error.expired) {
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
        // console.log('=== LOGIN SUCCESS ===');
        // console.log('User data from API:', result.user);
        // console.log('Avatar from API:', result.user?.avatar);
        
        // Обновляем пользователя в контексте и localStorage
        setUser(result.user);
        
        if (result.expires_at) {
          localStorage.setItem('token_expires_at', result.expires_at);
          setTokenExpiresAt(result.expires_at);
        }
        
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

  const updateProfile = async (profileData) => {
    try {
      const result = await authAPI.updateProfile(profileData);
      
      if (result.success && result.user) {
        const userData = { ...result.user };
        
        if (userData.avatar && userData.avatar.startsWith('/') && !userData.avatar.startsWith('http')) {
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://estate-backend.test';
          userData.avatar = baseUrl + userData.avatar;
        }
        
        // Обновляем пользователя в контексте и localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          message: result.message || 'Update failed',
          errors: result.errors 
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred' 
      };
    }
  };

  const removeAvatar = async () => {
    try {
      const result = await authAPI.removeAvatar();
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

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
    updateProfile,
    removeAvatar,
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