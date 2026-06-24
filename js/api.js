// js/api.js - Complete API Client
import { CONFIG } from './config.js';
import { Auth } from './auth.js';
import { showToast } from './utils.js';

export class API {
  constructor() {
    this.auth = new Auth();
    this.baseURL = CONFIG.supabase.url;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/rest/v1${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': CONFIG.supabase.key,
      'Authorization': `Bearer ${this.auth.token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error(`API ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      showToast('API Error: ' + error.message, 'error');
      throw error;
    }
  }

  async groqRequest(messages, model = 'llama-4-scout') {
    try {
      const response = await fetch(`${this.baseURL}/functions/v1/groq-gateway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.auth.token}`
        },
        body: JSON.stringify({ messages, model })
      });
      
      if (!response.ok) throw new Error('Groq request failed');
      return response;
    } catch (error) {
      showToast('AI Error: ' + error.message, 'error');
      throw error;
    }
  }

  // CHATS
  async createChat(title, model = 'llama-4-scout') {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ 
        title, 
        model, 
        user_id: this.auth.user.id 
      })
    });
  }

  async getChats() {
    return this.request(`/chats?user_id=eq.${this.auth.user.id}&order=created_at.desc`);
  }

  async updateChat(id, updates) {
    return this.request(`/chats?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteChat(id) {
    return this.request(`/chats?id=eq.${id}`, { method: 'DELETE' });
  }

  // MESSAGES
  async addMessage(chatId, role, content, model = 'llama-4-scout') {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ 
        chat_id: chatId, 
        role, 
        content,
        model 
      })
    });
  }

  async getMessages(chatId) {
    return this.request(`/messages?chat_id=eq.${chatId}&order=created_at.asc`);
  }

  // TASKS
  async createTask(title, description = '', priority = 'MEDIUM', dueDate = null) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        priority,
        due_date: dueDate,
        user_id: this.auth.user.id
      })
    });
  }

  async getTasks(status = null) {
    let query = `/tasks?user_id=eq.${this.auth.user.id}&order=due_date.asc`;
    if (status) query += `&status=eq.${status}`;
    return this.request(query);
  }

  async updateTask(id, updates) {
    return this.request(`/tasks?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks?id=eq.${id}`, { method: 'DELETE' });
  }

  // GOALS
  async createGoal(title, description = '', deadline = null) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        deadline,
        user_id: this.auth.user.id
      })
    });
  }

  async getGoals() {
    return this.request(`/goals?user_id=eq.${this.auth.user.id}&order=deadline.asc`);
  }

  async updateGoal(id, updates) {
    return this.request(`/goals?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteGoal(id) {
    return this.request(`/goals?id=eq.${id}`, { method: 'DELETE' });
  }

  // NOTES
  async createNote(title = 'Untitled', content = '', tags = []) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        tags,
        user_id: this.auth.user.id
      })
    });
  }

  async getNotes() {
    return this.request(`/notes?user_id=eq.${this.auth.user.id}&order=updated_at.desc`);
  }

  async updateNote(id, updates) {
    return this.request(`/notes?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteNote(id) {
    return this.request(`/notes?id=eq.${id}`, { method: 'DELETE' });
  }

  // PROJECTS
  async createProject(name, description = '') {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        user_id: this.auth.user.id
      })
    });
  }

  async getProjects() {
    return this.request(`/projects?user_id=eq.${this.auth.user.id}&order=created_at.desc`);
  }

  async updateProject(id, updates) {
    return this.request(`/projects?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects?id=eq.${id}`, { method: 'DELETE' });
  }

  // MEMORIES
  async createMemory(type, content, importance = 1, tags = []) {
    return this.request('/memories', {
      method: 'POST',
      body: JSON.stringify({
        memory_type: type,
        content,
        importance,
        tags,
        user_id: this.auth.user.id
      })
    });
  }

  async getMemories() {
    return this.request(`/memories?user_id=eq.${this.auth.user.id}&order=importance.desc`);
  }

  async updateMemory(id, updates) {
    return this.request(`/memories?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteMemory(id) {
    return this.request(`/memories?id=eq.${id}`, { method: 'DELETE' });
  }

  // PROFILE
  async getProfile() {
    const profiles = await this.request(`/profiles?user_id=eq.${this.auth.user.id}`);
    return profiles[0] || null;
  }

  async updateProfile(updates) {
    return this.request(`/profiles?user_id=eq.${this.auth.user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // ADMIN
  async getAllUsers() {
    return this.request('/profiles?order=created_at.desc');
  }

  async getAuditLogs() {
    return this.request('/audit_logs?order=created_at.desc&limit=100');
  }

  async getAnalytics() {
    return {
      totalUsers: (await this.request('/profiles')).length,
      totalChats: (await this.request('/chats')).length,
      totalTasks: (await this.request('/tasks')).length,
      totalGoals: (await this.request('/goals')).length
    };
  }
}

export const api = new API();
