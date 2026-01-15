import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      
      if (response.token) {
        const userData = { ...response.user };
        
        if (userData.avatar && userData.avatar.startsWith('/') && !userData.avatar.startsWith('http')) {
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://estate-backend.test';
          userData.avatar = baseUrl + userData.avatar;
        }
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { 
          success: true, 
          user: userData,
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
      return { 
        success: true, 
        user: response.user 
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  register: (data) => api.post('/register', data),

  updateProfile: async (data) => {
    try {
      console.log('Updating profile with data:', data);
      
      if (data.avatar instanceof File) {
        console.log('File detected, creating FormData...');
        console.log('File details:', {
          name: data.avatar.name,
          size: data.avatar.size,
          type: data.avatar.type,
          lastModified: data.avatar.lastModified
        });
        
        const formData = new FormData();
        formData.append('avatar', data.avatar);
        
        if (data.name) {
          formData.append('name', data.name);
          console.log('Adding name to FormData:', data.name);
        }
        
        if (data.password_current && data.password) {
          formData.append('password_current', data.password_current);
          formData.append('password', data.password);
          formData.append('password_confirmation', data.password_confirmation || data.password);
        }
        
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1]);
        }
        
        const response = await api.post('/user/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Response from server:', response);
        console.log('Avatar URL in response:', response.user?.avatar);
        
        if (response.user?.avatar) {
          console.log('Avatar uploaded successfully! URL:', response.user.avatar);
          fetch(response.user.avatar)
            .then(res => console.log('Avatar file accessible:', res.ok))
            .catch(err => console.error('Avatar file not accessible:', err));
        }
        
        return { success: true, user: response.user };
      } else {
        console.log('Regular data update:', data);
        
        const payload = {};
        if (data.name) payload.name = data.name;
        if (data.password_current && data.password) {
          payload.password_current = data.password_current;
          payload.password = data.password;
          payload.password_confirmation = data.password_confirmation || data.password;
        }
        
        console.log('Sending payload:', payload);
        const response = await api.post('/user/profile', payload);
        console.log('Response from server:', response);
        return { success: true, user: response.user };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      console.error('Error response:', error.response || error);
      console.error('Error data:', error.response?.data || error.message);
      
      return { 
        success: false, 
        message: error.message || 'Update failed',
        errors: error.errors || error.response?.data?.errors 
      };
    }
  },

  removeAvatar: async () => {
    try {
      console.log('Removing avatar...');
      const response = await api.delete('/user/avatar');
      console.log('Remove avatar response:', response);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Remove avatar error:', error);
      return { success: false, message: error.message };
    }
  }
};


export const postsAPI = {
  getAll: (params) => api.get('/admin/posts', { params }),
  getOne: (id) => api.get(`/admin/posts/${id}`),
  create: (data) => api.post('/admin/posts', data),
  update: (id, data) => api.put(`/admin/posts/${id}`, data),
  delete: (id) => api.delete(`/admin/posts/${id}`),
};

export const adminsAPI = {
  getAll: (params) => api.get('/admin/admins', { params }),
  getOne: (id) => api.get(`/admin/admins/${id}`),
  create: (data) => api.post('/admin/admins', data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data),
  delete: (id) => api.delete(`/admin/admins/${id}`),
};

export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getOne: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
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
  getMenus: (params) => api.get('/menus', { params }),
  getSettings: (group) => api.get(`/settings/${group}`),
  getAllSettings: () => api.get('/settings'),
};