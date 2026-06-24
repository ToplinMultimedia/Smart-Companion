import { api } from '../api.js';
import { showToast } from '../utils.js';

let allGoals = [];

export async function init() {
  console.log('Goals module initializing');
  await loadGoals();
  setupEventListeners();
  renderGoals();
}

async function loadGoals() {
  try {
    allGoals = await api.getGoals() || [];
  } catch (error) {
    console.error('Failed to load goals:', error);
    allGoals = [];
  }
}

function setupEventListeners() {
  const createBtn = document.getElementById('createGoalBtn');
  if (createBtn) {
    createBtn.addEventListener('click', showCreateGoalForm);
  }
}

function showCreateGoalForm() {
  const form = document.getElementById('createGoalForm');
  if (form) {
    form.classList.toggle('hidden');
  }
}

async function createGoal(e) {
  e.preventDefault();
  
  const title = document.getElementById('goalTitle')?.value;
  const description = document.getElementById('goalDescription')?.value;
  const deadline = document.getElementById('goalDeadline')?.value;

  if (!title) {
    showToast('Goal title is required', 'error');
    return;
  }

  try {
    await api.createGoal(title, description, deadline);
    showToast('Goal created!', 'success');
    document.getElementById('createGoalForm')?.reset();
    await loadGoals();
    renderGoals();
  } catch (error) {
    showToast('Failed to create goal', 'error');
  }
}

async function updateGoalProgress(goalId, progress) {
  try {
    progress = Math.min(100, Math.max(0, parseInt(progress) || 0));
    await api.updateGoal(goalId, { progress });
    await loadGoals();
    renderGoals();
  } catch (error) {
    showToast('Failed to update goal', 'error');
  }
}

async function deleteGoal(goalId) {
  if (confirm('Delete this goal?')) {
    try {
      await api.deleteGoal(goalId);
      await loadGoals();
      renderGoals();
      showToast('Goal deleted', 'success');
    } catch (error) {
      showToast('Failed to delete goal', 'error');
    }
  }
}

function renderGoals(goals = allGoals) {
  const container = document.getElementById('goalsList');
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = '<div class="text-center p-8 text-gray-500">No goals yet. Set one now!</div>';
    return;
  }

  container.innerHTML = goals.map(goal => `
    <div class="card goal-item animate-slideUp" data-goal-id="${goal.id}">
      <div class="flex-between mb-3">
        <h3 class="font-semibold text-lg">${goal.title}</h3>
        <span class="badge badge-${goal.status === 'COMPLETED' ? 'success' : 'info'}">${goal.status}</span>
      </div>
      
      ${goal.description ? `<p class="text-sm text-gray-600 mb-3">${goal.description}</p>` : ''}
      
      <div class="mb-3">
        <div class="flex-between mb-1">
          <span class="text-sm font-semibold">Progress</span>
          <span class="text-sm">${goal.progress || 0}%</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary to-secondary" style="width: ${goal.progress || 0}%"></div>
        </div>
      </div>

      <input type="range" min="0" max="100" value="${goal.progress || 0}" 
        class="w-full mb-3" onchange="window.goalsModule.updateProgress('${goal.id}', this.value)">

      ${goal.deadline ? `<div class="text-xs text-gray-500 mb-3">Deadline: ${new Date(goal.deadline).toLocaleDateString()}</div>` : ''}

      <button class="btn btn-danger btn-small w-full" onclick="window.goalsModule.delete('${goal.id}')">Delete Goal</button>
    </div>
  `).join('');
}

window.goalsModule = {
  updateProgress: updateGoalProgress,
  delete: deleteGoal,
  init,
  loadGoals
};
