import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      
      // Теперь response - это прямой объект от бэкенда
      // { user: {...}, token: "...", message: "..." }
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { 
          success: true, 
          user: response.user, 
          token: response.token 
        };
      } else {
        return { 
          success: false, 
          message: response.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || error.message || 'Network error' 
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  getUser: async () => {
    try {
      const response = await api.get('/user');
      // response = { user: {...} }
      return { 
        success: true, 
        user: response.user 
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  register: (data) => api.post('/register', data),
};

export const postsAPI = {
  getAll: (params) => api.get('/admin/posts', { params }),
  getOne: (id) => api.get(`/admin/posts/${id}`),
  create: (data) => api.post('/admin/posts', data),
  update: (id, data) => api.put(`/admin/posts/${id}`, data),
  delete: (id) => api.delete(`/admin/posts/${id}`),
};

export const pagesAPI = {
  getAll: (params) => api.get('/admin/pages', { params }),
  getList: () => api.get('/admin/pages/list'),
  getOne: (id) => api.get(`/admin/pages/${id}`),
  create: (data) => api.post('/admin/pages', data),
  update: (id, data) => api.put(`/admin/pages/${id}`, data),
  delete: (id) => api.delete(`/admin/pages/${id}`),
  generateSeo: (id) => api.post(`/admin/pages/${id}/generate-seo`),
};

export const tagsAPI = {
  getAll: (params) => api.get('/admin/tags', { params }),
  getOne: (id) => api.get(`/admin/tags/${id}`),
  create: (data) => api.post('/admin/tags', data),
  update: (id, data) => api.put(`/admin/tags/${id}`, data),
  delete: (id) => api.delete(`/admin/tags/${id}`),
};

export const employeesAPI = {
  getAll: (params) => api.get('/admin/employees', { params }),
  getOne: (id) => api.get(`/admin/employees/${id}`),
  create: (data) => api.post('/admin/employees', data),
  update: (id, data) => api.put(`/admin/employees/${id}`, data),
  delete: (id) => api.delete(`/admin/employees/${id}`),
};

export const testimonialsAPI = {
  getAll: (params) => api.get('/admin/testimonials', {params}),
  getOne: (id) => api.get(`/admin/testimonials/${id}`),
  create: (data) => api.post('/admin/testimonials', data),
  update: (id, data) => api.put(`/admin/testimonials/${id}`, data),
  delete: (id) => api.delete(`/admin/testimonials/${id}`),
};

export const partnersAPI = {
  getAll: (params) => api.get('/admin/partners', {params}),
  getOne: (id) => api.get(`/admin/partners/${id}`),
  create: (data) => api.post('/admin/partners', data),
  update: (id, data) => api.put(`/admin/partners/${id}`, data),
  delete: (id) => api.delete(`/admin/partners/${id}`),
};

export const menusAPI = {
  getAll: (params) => api.get('/admin/menus', {params}),
  getOne: (id) => api.get(`/admin/menus/${id}`),
  create: (data) => api.post('/admin/menus', data),
  update: (id, data) => api.put(`/admin/menus/${id}`, data),
  delete: (id) => api.delete(`/admin/menus/${id}`),
  rebuild: (data) => api.put('/admin/menus/rebuild', data),
};

export const settingsAPI = {
  getGroup: (group) => api.get(`/admin/settings/${group}`),
  updateGroup: (group, data) => api.post(`/admin/settings/${group}`, data),
};

export const publicAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPages: () => api.get('/pages'),
  getTags: () => api.get('/tags'),
  getEmployees: () => api.get('/employees'),
  getTestimonials: () => api.get('/testimonials'),
  getPartners: () => api.get('/partners'),
  getMenus: () => api.get('/menus'),
  getSettings: (group) => api.get(`/settings/${group}`),
  getAllSettings: () => api.get('/settings'),
};