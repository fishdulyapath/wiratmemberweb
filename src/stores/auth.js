import { defineStore } from 'pinia';
import { authApi } from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    customer: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isStaff: (state) => state.user?.role === 'staff',
    isMember: (state) => state.user?.role === 'member',
    custCode: (state) => state.user?.cust_code,
  },

  actions: {
    async login(username, password) {
      const { data } = await authApi.login({ username, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },

    async fetchMe() {
      try {
        const { data } = await authApi.me();
        this.user = data.user;
        this.customer = data.user.customer || null;
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        this.logout();
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.customer = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
