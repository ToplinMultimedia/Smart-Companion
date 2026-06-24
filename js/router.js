// js/router.js - Client-side Routing
import { CONFIG } from './config.js';

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
  }

  register(path, handler) {
    this.routes.set(path, handler);
  }

  async navigate(path) {
    const handler = this.routes.get(path);
    if (handler) {
      await handler();
      this.currentRoute = path;
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('chat')) return 'chat';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('goals')) return 'goals';
    if (path.includes('tasks')) return 'tasks';
    if (path.includes('notes')) return 'notes';
    if (path.includes('admin')) return 'admin';
    return 'index';
  }
}

export const router = new Router();
