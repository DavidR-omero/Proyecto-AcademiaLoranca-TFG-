var API = {
  BASE: '',

  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(this.BASE + path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  },

  login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password })
    });
  },

  register(username, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ username, email, password })
    });
  },

  me() {
    return this.request('/api/auth/me');
  },

  updateProfile(email) {
    return this.request('/api/auth/me', {
      method: 'PUT', body: JSON.stringify({ email })
    });
  },
  changePassword(currentPassword, newPassword) {
    return this.request('/api/auth/me', {
      method: 'PUT', body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  getCourses() {
    return this.request('/api/courses');
  },

  getAnnouncements() {
    return this.request('/api/announcements');
  },

  getEvents() {
    return this.request('/api/events/upcoming');
  },

  getAllEvents() {
    return this.request('/api/events');
  },

  getMyMessages() {
    return this.request('/api/contact/my');
  },

  sendContact(data) {
    return this.request('/api/contact', {
      method: 'POST', body: JSON.stringify(data)
    });
  },

  admin: {
    getStats() { return API.request('/api/admin/stats'); },
    getUsers() { return API.request('/api/admin/users'); },
    updateUser(id, data) {
      return API.request(`/api/admin/users/${id}`, {
        method: 'PUT', body: JSON.stringify(data)
      });
    },
    deleteUser(id) {
      return API.request(`/api/admin/users/${id}`, { method: 'DELETE' });
    },
    getMessages() { return API.request('/api/admin/messages'); },
    markRead(id) {
      return API.request(`/api/admin/messages/${id}/read`, { method: 'PUT' });
    },
    deleteMessage(id) {
      return API.request(`/api/admin/messages/${id}`, { method: 'DELETE' });
    },
    getCourses() { return API.request('/api/courses'); },
    createCourse(data) {
      return API.request('/api/admin/courses', {
        method: 'POST', body: JSON.stringify(data)
      });
    },
    updateCourse(id, data) {
      return API.request(`/api/admin/courses/${id}`, {
        method: 'PUT', body: JSON.stringify(data)
      });
    },
    deleteCourse(id) {
      return API.request(`/api/admin/courses/${id}`, { method: 'DELETE' });
    },
    getAnnouncements() { return API.request('/api/admin/announcements'); },
    createAnnouncement(data) {
      return API.request('/api/admin/announcements', {
        method: 'POST', body: JSON.stringify(data)
      });
    },
    updateAnnouncement(id, data) {
      return API.request(`/api/admin/announcements/${id}`, {
        method: 'PUT', body: JSON.stringify(data)
      });
    },
    deleteAnnouncement(id) {
      return API.request(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    },
    replyMessage(id, reply) {
      return API.request(`/api/admin/messages/${id}/reply`, {
        method: 'PUT', body: JSON.stringify({ reply })
      });
    },
    getEvents() { return API.request('/api/admin/events'); },
    createEvent(data) {
      return API.request('/api/admin/events', {
        method: 'POST', body: JSON.stringify(data)
      });
    },
    updateEvent(id, data) {
      return API.request(`/api/admin/events/${id}`, {
        method: 'PUT', body: JSON.stringify(data)
      });
    },
    deleteEvent(id) {
      return API.request(`/api/admin/events/${id}`, { method: 'DELETE' });
    },
    getAll(tableName) {
      return API.request(`/api/admin/table/${tableName}`);
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },

  setSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};
