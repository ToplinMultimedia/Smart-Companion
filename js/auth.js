// js/auth.js - Authentication
import { CONFIG } from './config.js';
import { showToast } from './utils.js';

export class Auth {
  constructor() {
    this.user = null;
    this.token = null;
    this.loadFromStorage();
  }

  async login(email, password) {
    try {
      // This would call your Supabase Auth API
      const response = await fetch(`${CONFIG.supabase.url}/auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          grant_type: 'password'
        })
      });

      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      this.setSession(data);
      showToast('Logged in successfully!', 'success');
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }

  async signup(email, password) {
    try {
      const response = await fetch(`${CONFIG.supabase.url}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Signup failed');
      
      const data = await response.json();
      showToast('Account created! Please log in.', 'success');
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }

  setSession(session) {
    this.token = session.access_token;
    this.user = session.user;
    localStorage.setItem('auth-token', this.token);
    localStorage.setItem('auth-user', JSON.stringify(this.user));
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    window.location.href = CONFIG.routes.login;
  }

  loadFromStorage() {
    this.token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }
}
