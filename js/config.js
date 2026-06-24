// js/config.js
export const CONFIG = {
  app: { name: 'SMART', version: '1.0.0' },
  supabase: {
    url: 'https://hdvhxqzngednqbdwuefr.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkdmh4cXpuZ2VkbnFiZHd1ZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTI2MjMsImV4cCI6MjA5NzgyODYyM30.0BBHeruBD6_7kjZOVwSDr3mKXagPOgu8breipOfMhFk'
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: {
      chat: 'llama-4-scout',
      reasoning: 'qwen-qwq-32b',
      research: 'deepseek-r1-distill-llama-70b',
      creative: 'llama-4-maverick',
      fallback: 'llama-3.3-70b-versatile'
    }
  },
  theme: { default: 'system', storageKey: 'smart-theme' },
  routes: {
    login: '/login.html',
    dashboard: '/dashboard.html',
    chat: '/chat.html'
  }
};

export const COLORS = {
  primary: '#7C3AED',
  secondary: '#A855F7',
  accent: '#C084FC',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444'
};
