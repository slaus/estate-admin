import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools((set, get) => ({
    // Состояние
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    notifications: [],
    
    // Действия
    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },
    
    setLoading: (isLoading) => set({ isLoading }),
    
    addNotification: (notification) => {
      const notifications = get().notifications;
      set({ 
        notifications: [...notifications, { ...notification, id: Date.now() }]
      });
    },
    
    removeNotification: (id) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    },
    
    clearNotifications: () => set({ notifications: [] }),
    
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      set({ user: null, notifications: [] });
    }
  }))
);

export default useStore;