// js/theme.js - Theme Management
import { CONFIG } from './config.js';

export class Theme {
  constructor() {
    this.current = this.getTheme();
    this.init();
  }

  init() {
    if (this.current === 'system') {
      this.current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    this.apply(this.current);
    this.setupToggle();
  }

  getTheme() {
    return localStorage.getItem(CONFIG.theme.storageKey) || CONFIG.theme.default;
  }

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.theme.storageKey, theme);
    this.current = theme;
  }

  toggle() {
    const newTheme = this.current === 'dark' ? 'light' : 'dark';
    this.apply(newTheme);
    return newTheme;
  }

  setupToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        this.toggle();
        this.updateToggleIcon();
      });
      this.updateToggleIcon();
    }
  }

  updateToggleIcon() {
    const light = document.querySelector('.icon-light');
    const dark = document.querySelector('.icon-dark');
    if (light && dark) {
      if (this.current === 'dark') {
        light.classList.add('hidden');
        dark.classList.remove('hidden');
      } else {
        light.classList.remove('hidden');
        dark.classList.add('hidden');
      }
    }
  }
}
