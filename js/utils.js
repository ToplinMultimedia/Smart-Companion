// js/utils.js - Utility Functions
export const showToast = (message, type = 'info', duration = 3000) => {
  const toast = document.createElement('div');
  toast.className = `toast animate-slideInRight`;
  toast.textContent = message;
  toast.style.background = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#3B82F6';
  toast.style.color = 'white';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const showModal = (title, message, onConfirm) => {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop active';
  const modal = document.createElement('div');
  modal.className = 'modal animate-slideDown';
  modal.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-secondary" id="cancel">Cancel</button>
      <button class="btn btn-primary" id="confirm">Confirm</button>
    </div>
  `;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  backdrop.querySelector('#cancel').addEventListener('click', () => backdrop.remove());
  backdrop.querySelector('#confirm').addEventListener('click', () => {
    onConfirm();
    backdrop.remove();
  });
};

export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const getQueryParam = (param) => {
  return new URLSearchParams(window.location.search).get(param);
};

export const setQueryParam = (param, value) => {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.replaceState({}, '', url);
};
