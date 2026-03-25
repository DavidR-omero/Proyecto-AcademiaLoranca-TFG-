/*
  API Client - Capa de comunicación con el backend
  Todas las llamadas pasan por API.request() que maneja:
    - Inyección automática del token JWT
    - Cabecera Content-Type application/json
    - Parseo de respuesta y manejo de errores
*/

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

  /* ── Autenticación ── */
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

  // Recuperación de contraseña en 3 pasos
  sendResetCode(email) {
    return this.request('/api/auth/send-reset-code', {
      method: 'POST', body: JSON.stringify({ email })
    });
  },
  verifyResetCode(email, code) {
    return this.request('/api/auth/verify-reset-code', {
      method: 'POST', body: JSON.stringify({ email, code })
    });
  },
  resetPassword(email, token, newPassword) {
    return this.request('/api/auth/reset-password', {
      method: 'POST', body: JSON.stringify({ email, token, newPassword })
    });
  },

  /* ── Cursos y matriculación ── */
  getCourses() {
    return this.request('/api/courses');
  },
  enrollCourse(courseId) {
    return this.request('/api/courses/enroll', {
      method: 'POST', body: JSON.stringify({ course_id: courseId })
    });
  },
  unenrollCourse(courseId) {
    return this.request(`/api/courses/enroll/${courseId}`, { method: 'DELETE' });
  },
  getMyCourses() {
    return this.request('/api/courses/my/enrollments');
  },

  /* ── Anuncios y eventos (públicos) ── */
  getAnnouncements() {
    return this.request('/api/announcements');
  },
  getEvents() {
    return this.request('/api/events');
  },
  getSchedules() {
    return this.request('/api/schedules');
  },
  getTeachers() {
    return this.request('/api/teachers');
  },

  /* ── Formulario de contacto ── */
  getMyMessages() {
    return this.request('/api/contact/my');
  },
  sendContact(data) {
    return this.request('/api/contact', {
      method: 'POST', body: JSON.stringify(data)
    });
  },
  getNotifications() {
    return this.request('/api/notifications');
  },

  /* ── Administrador ── */
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
    replyMessage(id, reply) {
      return API.request(`/api/admin/messages/${id}/reply`, {
        method: 'PUT', body: JSON.stringify({ reply })
      });
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
    getCourseStudents(courseId) {
      return API.request(`/api/admin/courses/${courseId}/students`);
    },
    deleteEnrollment(id) {
      return API.request(`/api/admin/enrollments/${id}`, { method: 'DELETE' });
    },
    getOrders() { return API.request('/api/admin/orders'); },
    updateOrderStatus(id, status) {
      return API.request(`/api/admin/orders/${id}/status`, {
        method: 'PUT', body: JSON.stringify({ status })
      });
    },
    getTeachers() { return API.request('/api/admin/teachers'); },
    createTeacher(data) {
      return API.request('/api/admin/teachers', {
        method: 'POST', body: JSON.stringify(data)
      });
    },
    updateTeacher(id, data) {
      return API.request(`/api/admin/teachers/${id}`, {
        method: 'PUT', body: JSON.stringify(data)
      });
    },
    deleteTeacher(id) {
      return API.request(`/api/admin/teachers/${id}`, { method: 'DELETE' });
    },
    getAll(tableName) {
      return API.request(`/api/admin/table/${tableName}`);
    }
  },

  /* ── Carrito (localStorage) ── */
  getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  },
  setCart(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-changed', { detail: items }));
  },
  addToCart(item) {
    if (!API.isLoggedIn()) {
      window.dispatchEvent(new CustomEvent('cart-login-required', { detail: 'Debes iniciar sesión para añadir cursos al carrito' }));
      return;
    }
    const cart = API.getCart();
    if (!cart.find(c => c.course_id === item.course_id)) {
      cart.push(item);
      API.setCart(cart);
    }
  },
  removeFromCart(courseId) {
    API.setCart(API.getCart().filter(c => c.course_id !== courseId));
  },
  clearCart() { API.setCart([]); },
  getCartTotal() {
    return API.getCart().reduce((s, i) => s + (i.price || 0), 0);
  },
  getCartCount() { return API.getCart().length; },

  /* ── Pedidos ── */
  createOrder(items, payment_method = '', payment_last4 = '') {
    return API.request('/api/orders', {
      method: 'POST', body: JSON.stringify({ items, payment_method, payment_last4 })
    });
  },
  getMyOrders() {
    return API.request('/api/orders');
  },

  /* ── Sesión ── */
  setSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
