import { api } from '../api.js';
import { showToast } from '../utils.js';

let currentChatId = null;
let allChats = [];
let currentMessages = [];

export async function init() {
  console.log('Chat module initializing');
  await loadChats();
  setupEventListeners();
  renderChats();
  
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get('id');
  if (chatId) {
    await selectChat(chatId);
  } else if (allChats.length > 0) {
    await selectChat(allChats[0].id);
  }
}

async function loadChats() {
  try {
    allChats = await api.getChats() || [];
  } catch (error) {
    console.error('Failed to load chats:', error);
    allChats = [];
  }
}

function setupEventListeners() {
  const newChatBtn = document.getElementById('newChatBtn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', createNewChat);
  }

  const sendBtn = document.getElementById('sendMessage');
  const input = document.getElementById('messageInput');
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

async function createNewChat() {
  const title = prompt('Chat title:', `Chat ${new Date().toLocaleDateString()}`);
  if (!title) return;

  try {
    const chat = await api.createChat(title, 'llama-4-scout');
    await loadChats();
    renderChats();
    await selectChat(chat[0].id);
    showToast('New chat created!', 'success');
  } catch (error) {
    showToast('Failed to create chat', 'error');
  }
}

async function selectChat(chatId) {
  currentChatId = chatId;
  currentMessages = [];
  
  try {
    const messages = await api.getMessages(chatId);
    currentMessages = messages || [];
    renderMessages();
    renderChats();
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input?.value.trim();

  if (!message || !currentChatId) return;

  // Show user message immediately
  currentMessages.push({
    role: 'user',
    content: message,
    created_at: new Date().toISOString()
  });
  renderMessages();
  input.value = '';

  try {
    // Save user message
    await api.addMessage(currentChatId, 'user', message);

    // Get AI response
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: currentChatId,
        messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
        model: 'llama-4-scout',
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error('Chat API failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';

    currentMessages.push({
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    });
    renderMessages();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      aiMessage += chunk;
      currentMessages[currentMessages.length - 1].content = aiMessage;
      renderMessages();
    }

    // Save AI message
    await api.addMessage(currentChatId, 'assistant', aiMessage);
    
  } catch (error) {
    showToast('Failed to send message', 'error');
    console.error(error);
    // Remove the message on error
    currentMessages.pop();
    renderMessages();
  }
}

function renderChats() {
  const container = document.getElementById('chatsList');
  if (!container) return;

  container.innerHTML = allChats.map(chat => `
    <div class="p-3 rounded-lg cursor-pointer transition-colors ${
      chat.id === currentChatId 
        ? 'bg-primary text-white' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }" onclick="window.chatModule.selectChat('${chat.id}')">
      <div class="font-semibold truncate">${chat.title}</div>
      <div class="text-xs ${chat.id === currentChatId ? 'text-blue-100' : 'text-gray-500'} truncate">
        ${new Date(chat.created_at).toLocaleDateString()}
      </div>
    </div>
  `).join('');
}

function renderMessages() {
  const container = document.getElementById('messages');
  if (!container) return;

  container.innerHTML = currentMessages.map(msg => `
    <div class="message ${msg.role === 'user' ? 'user-message' : 'ai-message'} animate-slideUp">
      <div class="message-content">
        ${msg.content.replace(/\n/g, '<br>')}
      </div>
      <div class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

window.chatModule = {
  selectChat,
  init,
  loadChats
};
