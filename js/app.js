// js/app.js - App Initialization
import { Theme } from './theme.js';
import { Auth } from './auth.js';

class App {
  constructor() {
    this.theme = new Theme();
    this.auth = new Auth();
  }

  async init() {
    console.log('SMART App Initializing...');
    if (!this.isAuthPage() && !this.auth.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    this.setupEventListeners();
    this.registerServiceWorker();
    console.log('SMART App Ready');
  }

  isAuthPage() {
    const path = window.location.pathname;
    return path.includes('login.html') || path.includes('index.html') || path === '/';
  }

  setupEventListeners() {
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', () => this.auth.logout());
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App().init();
  });
} else {
  new App().init();
}
