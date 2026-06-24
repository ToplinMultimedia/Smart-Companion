// js/auth.js - Authentication with Supabase
import { CONFIG } from './config.js';
import { showToast } from './utils.js';

export class Auth {
  constructor() {
    this.user = null;
    this.token = null;
    this.loadFromStorage();
  }

  async signup(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password required');
      }

      // Supabase Auth endpoint for signup
      const response = await fetch(
        `${CONFIG.supabase.url}/auth/v1/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': CONFIG.supabase.key
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error_description || 'Signup failed');
      }

      showToast('Account created! Please log in.', 'success');
      return data;
    } catch (error) {
      console.error('Signup Error:', error);
      showToast('Signup failed: ' + error.message, 'error');
      throw error;
    }
  }

  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password required');
      }

      // Supabase Auth endpoint for login
      const response = await fetch(
        `${CONFIG.supabase.url}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': CONFIG.supabase.key
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error_description || 'Login failed');
      }

      this.setSession(data);
      showToast('Logged in successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Login Error:', error);
      showToast('Login failed: ' + error.message, 'error');
      throw error;
    }
  }

  setSession(session) {
    this.token = session.access_token;
    this.user = session.user || { id: session.user?.id, email: session.user?.email };
    localStorage.setItem('auth-token', this.token);
    localStorage.setItem('auth-user', JSON.stringify(this.user));
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    window.location.href = '/login.html';
  }

  loadFromStorage() {
    const token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    
    if (token && userStr) {
      this.token = token;
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        this.user = null;
      }
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'apikey': CONFIG.supabase.key
    };
  }
}
