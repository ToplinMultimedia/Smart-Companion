import { api } from '../api.js';
import { showToast } from '../utils.js';

let allTasks = [];

export async function init() {
  console.log('Tasks module initializing');
  await loadTasks();
  setupEventListeners();
  renderTasks();
}

async function loadTasks() {
  try {
    allTasks = await api.getTasks() || [];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    allTasks = [];
  }
}

function setupEventListeners() {
  const createBtn = document.getElementById('createTaskBtn');
  if (createBtn) {
    createBtn.addEventListener('click', showCreateTaskForm);
  }

  const filterBtns = document.querySelectorAll('[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterTasks(e.target.dataset.filter);
    });
  });
}

function showCreateTaskForm() {
  const form = document.getElementById('createTaskForm');
  if (form) {
    form.classList.toggle('hidden');
  }
}

async function createTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('taskTitle')?.value;
  const description = document.getElementById('taskDescription')?.value;
  const dueDate = document.getElementById('taskDueDate')?.value;
  const priority = document.getElementById('taskPriority')?.value || 'MEDIUM';

  if (!title) {
    showToast('Task title is required', 'error');
    return;
  }

  try {
    await api.createTask(title, description, dueDate, priority);
    showToast('Task created!', 'success');
    document.getElementById('createTaskForm')?.reset();
    await loadTasks();
    renderTasks();
  } catch (error) {
    showToast('Failed to create task', 'error');
    console.error(error);
  }
}

async function updateTaskStatus(taskId, status) {
  try {
    await api.updateTask(taskId, { status });
    await loadTasks();
    renderTasks();
    showToast('Task updated!', 'success');
  } catch (error) {
    showToast('Failed to update task', 'error');
  }
}

async function deleteTask(taskId) {
  if (confirm('Delete this task?')) {
    try {
      await api.deleteTask(taskId);
      await loadTasks();
      renderTasks();
      showToast('Task deleted', 'success');
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  }
}

function filterTasks(filter) {
  let filtered = allTasks;
  
  if (filter === 'active') {
    filtered = allTasks.filter(t => t.status !== 'DONE');
  } else if (filter === 'completed') {
    filtered = allTasks.filter(t => t.status === 'DONE');
  } else if (filter === 'high') {
    filtered = allTasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT');
  }

  renderTasks(filtered);
}

function renderTasks(tasks = allTasks) {
  const container = document.getElementById('tasksList');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = '<div class="text-center p-8 text-gray-500">No tasks yet. Create one to get started!</div>';
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="card task-item animate-slideUp" data-task-id="${task.id}">
      <div class="flex-between mb-2">
        <h3 class="font-semibold text-lg">${task.title}</h3>
        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      
      ${task.description ? `<p class="text-sm text-gray-600 mb-3">${task.description}</p>` : ''}
      
      <div class="flex-between mb-3">
        <span class="text-xs text-gray-500">
          ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
        </span>
        <span class="text-xs font-semibold">${task.status}</span>
      </div>

      <div class="flex gap-2">
        <select class="input text-sm flex-1" onchange="window.tasksModule.updateStatus('${task.id}', this.value)">
          <option value="TODO" ${task.status === 'TODO' ? 'selected' : ''}>To Do</option>
          <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>Done</option>
          <option value="CANCELED" ${task.status === 'CANCELED' ? 'selected' : ''}>Canceled</option>
        </select>
        <button class="btn btn-danger btn-small" onclick="window.tasksModule.delete('${task.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Expose to window for inline onclick handlers
window.tasksModule = {
  updateStatus: updateTaskStatus,
  delete: deleteTask,
  init,
  loadTasks
};
