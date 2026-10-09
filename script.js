/* ==========================================================
   Pallavi AI — Chat Application Logic
   Demo-mode chatbot with simulated AI responses
   ========================================================== */

(function() {
'use strict';

// ==================== STATE ====================
var chats = [];          // [{ id, title, messages: [{role, content}], createdAt }]
var currentChatId = null;
var isTyping = false;

// ==================== DOM ELEMENTS ====================
var sidebar = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebarOverlay');
var btnSidebarOpen = document.getElementById('sidebarOpen');
var btnSidebarClose = document.getElementById('sidebarClose');
var btnNewChat = document.getElementById('btnNewChat');
var btnClearChat = document.getElementById('btnClearChat');
var btnThemeToggle = document.getElementById('btnThemeToggle');
var btnSend = document.getElementById('btnSend');
var messageInput = document.getElementById('messageInput');
var chatContainer = document.getElementById('chatContainer');
var welcomeScreen = document.getElementById('welcomeScreen');
var chatHistory = document.getElementById('chatHistory');

// ==================== STORAGE ====================
var STORAGE_KEY = 'pallavi_ai_chats';
var THEME_KEY = 'pallavi_ai_theme';

function saveChats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch(e) { console.warn('Save failed:', e); }
}

function loadChats() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      chats = JSON.parse(data);
    }
  } catch(e) { console.warn('Load failed:', e); }
}

function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch(e) {}
}

function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch(e) { return 'dark'; }
}

// ==================== THEME ====================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var iconMoon = document.getElementById('iconMoon');
  var iconSun = document.getElementById('iconSun');
  var label = document.getElementById('themeLabel');
  if (theme === 'dark') {
    iconMoon.style.display = '';
    iconSun.style.display = 'none';
    label.textContent = 'Light Mode';
  } else {
    iconMoon.style.display = 'none';
    iconSun.style.display = '';
    label.textContent = 'Dark Mode';
  }
  saveTheme(theme);
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ==================== CHAT MANAGEMENT ====================
function createNewChat() {
  var chat = {
    id: 'chat_' + Date.now(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now()
  };
  chats.unshift(chat);
  currentChatId = chat.id;
  saveChats();
  renderChatHistory();
  renderMessages();
  closeSidebarMobile();
  messageInput.focus();
}

function getCurrentChat() {
  for (var i = 0; i < chats.length; i++) {
    if (chats[i].id === currentChatId) return chats[i];
  }
  return null;
}

function selectChat(chatId) {
  currentChatId = chatId;
  renderChatHistory();
  renderMessages();
  closeSidebarMobile();
}

function deleteChat(chatId, event) {
  if (event) event.stopPropagation();
  chats = chats.filter(function(c) { return c.id !== chatId; });
  if (currentChatId === chatId) {
    currentChatId = chats.length > 0 ? chats[0].id : null;
  }
  saveChats();
  renderChatHistory();
  renderMessages();
}

function clearCurrentChat() {
  var chat = getCurrentChat();
  if (!chat || chat.messages.length === 0) return;
  chat.messages = [];
  chat.title = 'New Chat';
  saveChats();
  renderChatHistory();
  renderMessages();
}

// ==================== RENDERING ====================
function renderChatHistory() {
  chatHistory.innerHTML = '';

  if (chats.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'history-empty';
    empty.textContent = 'No chats yet. Click "New Chat" to start.';
    chatHistory.appendChild(empty);
    return;
  }

  chats.forEach(function(chat) {
    var item = document.createElement('div');
    item.className = 'history-item' + (chat.id === currentChatId ? ' active' : '');

    var icon = document.createElement('span');
    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    var text = document.createElement('span');
    text.className = 'history-text';
    text.textContent = chat.title;

    var del = document.createElement('button');
    del.className = 'history-delete';
    del.title = 'Delete chat';
    del.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    del.addEventListener('click', function(e) { deleteChat(chat.id, e); });

    item.appendChild(icon);
    item.appendChild(text);
    item.appendChild(del);
    item.addEventListener('click', function() { selectChat(chat.id); });
    chatHistory.appendChild(item);
  });
}

function renderMessages() {
  var chat = getCurrentChat();

  if (!chat || chat.messages.length === 0) {
    welcomeScreen.style.display = '';
    chatContainer.classList.remove('active');
    chatContainer.innerHTML = '';
    return;
  }

  welcomeScreen.style.display = 'none';
  chatContainer.classList.add('active');
  chatContainer.innerHTML = '';

  chat.messages.forEach(function(msg) {
    appendMessageElement(msg.role, msg.content);
  });

  scrollToBottom();
}

function appendMessageElement(role, content) {
  var msg = document.createElement('div');
  msg.className = 'message ' + role;

  var avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? 'U' : 'P';

  var contentWrap = document.createElement('div');
  contentWrap.className = 'message-content';

  var bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = content;
  contentWrap.appendChild(bubble);

  // Copy button for AI messages
  if (role === 'ai') {
    var actions = document.createElement('div');
    actions.className = 'message-actions';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'message-action-btn';
    copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> <span>Copy</span>';
    copyBtn.addEventListener('click', function() {
      copyToClipboard(content);
      copyBtn.classList.add('copied');
      copyBtn.querySelector('span').textContent = 'Copied!';
      setTimeout(function() {
        copyBtn.classList.remove('copied');
        copyBtn.querySelector('span').textContent = 'Copy';
      }, 2000);
    });
    actions.appendChild(copyBtn);
    contentWrap.appendChild(actions);
  }

  msg.appendChild(avatar);
  msg.appendChild(contentWrap);
  chatContainer.appendChild(msg);

  return msg;
}

function appendTypingIndicator() {
  var msg = document.createElement('div');
  msg.className = 'message ai';
  msg.id = 'typingMessage';

  var avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = 'P';

  var contentWrap = document.createElement('div');
  contentWrap.className = 'message-content';

  var bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  var indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  bubble.appendChild(indicator);
  contentWrap.appendChild(bubble);
  msg.appendChild(avatar);
  msg.appendChild(contentWrap);
  chatContainer.appendChild(msg);

  scrollToBottom();
}

function removeTypingIndicator() {
  var typing = document.getElementById('typingMessage');
  if (typing) typing.remove();
}

function scrollToBottom() {
  setTimeout(function() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 50);
}

// ==================== SEND / RECEIVE ====================
function sendMessage(text) {
  text = text.trim();
  if (!text || isTyping) return;

  // Create chat if none exists
  if (!currentChatId) {
    createNewChat();
  }

  var chat = getCurrentChat();
  if (!chat) return;

  // Add user message
  chat.messages.push({ role: 'user', content: text });

  // Set chat title from first message
  if (chat.messages.length === 1) {
    chat.title = text.length > 40 ? text.substring(0, 40) + '...' : text;
  }

  saveChats();
  renderChatHistory();

  // Show chat view
  welcomeScreen.style.display = 'none';
  chatContainer.classList.add('active');
  appendMessageElement('user', text);
  scrollToBottom();

  // Clear input
  messageInput.value = '';
  autoResize();
  updateSendButton();

  // Simulate AI response
  isTyping = true;
  appendTypingIndicator();

  var response = generateDemoResponse(text);
  var delay = 800 + Math.random() * 1200;

  setTimeout(function() {
    removeTypingIndicator();
    isTyping = false;

    chat.messages.push({ role: 'ai', content: response });
    saveChats();

    appendMessageElement('ai', response);
    scrollToBottom();
  }, delay);
}

// ==================== DEMO RESPONSE SYSTEM ====================
function generateDemoResponse(userText) {
  var lower = userText.toLowerCase();

  // Python explanation
  if (lower.indexOf('python') >= 0) {
    return "Python is a high-level, interpreted programming language known for its simple, readable syntax. Here's what makes it special:\n\n" +
      "1. Easy to Learn: Python's syntax reads almost like English, making it beginner-friendly.\n" +
      "2. Versatile: Used for web development, data science, AI, automation, and more.\n" +
      "3. Large Community: Millions of developers contribute to a vast ecosystem of libraries.\n" +
      "4. Cross-Platform: Runs on Windows, Mac, and Linux without modification.\n\n" +
      "Example — Hello World in Python:\n" +
      "print(\"Hello, World!\")\n\n" +
      "Python is a great first language because you can start building real projects very quickly!\n\n" +
      "[Demo Response — This is a simulated answer for demonstration purposes.]";
  }

  // Interview preparation
  if (lower.indexOf('interview') >= 0) {
    return "Here are some key tips for interview preparation:\n\n" +
      "Common Questions to Practice:\n" +
      "1. \"Tell me about yourself\" — Keep it to 2 minutes, focus on relevant experience.\n" +
      "2. \"Why do you want this role?\" — Research the company and connect it to your goals.\n" +
      "3. \"What are your strengths?\" — Give specific examples, not just adjectives.\n" +
      "4. \"Describe a challenge you faced\" — Use the STAR method (Situation, Task, Action, Result).\n\n" +
      "Preparation Tips:\n" +
      "- Research the company thoroughly\n" +
      "- Practice answering aloud, not just in your head\n" +
      "- Prepare 2-3 questions to ask the interviewer\n" +
      "- Dress appropriately and arrive 10 minutes early\n" +
      "- Follow up with a thank-you email within 24 hours\n\n" +
      "Remember: Confidence comes from preparation. You've got this!\n\n" +
      "[Demo Response — This is a simulated answer for demonstration purposes.]";
  }

  // Project idea
  if (lower.indexOf('project idea') >= 0 || lower.indexOf('project') >= 0) {
    return "Here's a creative project idea for your college assignment:\n\n" +
      "Project: EcoTrack — A Personal Carbon Footprint Tracker\n\n" +
      "Description:\n" +
      "Build a web app that helps users track their daily carbon footprint based on their transportation, food choices, and energy usage. The app provides personalized suggestions to reduce emissions.\n\n" +
      "Key Features:\n" +
      "1. Daily activity logging (transport, food, energy)\n" +
      "2. Carbon footprint calculator with visual charts\n" +
      "3. Weekly progress reports and goals\n" +
      "4. Achievement badges for reducing emissions\n" +
      "5. Comparison with average footprints in your region\n\n" +
      "Tech Stack: HTML, CSS, JavaScript, Chart.js for visualizations\n\n" +
      "This project is practical, educational, and demonstrates real-world problem solving!\n\n" +
      "[Demo Response — This is a simulated answer for demonstration purposes.]";
  }

  // Poem
  if (lower.indexOf('poem') >= 0) {
    return "Here's a short poem about technology and nature:\n\n" +
      "Silicon and sunlight, side by side,\n" +
      "In circuits green, the forests hide.\n" +
      "A smartphone hums where rivers flow,\n" +
      "Both wired and wild, they learn and grow.\n\n" +
      "The code that runs through every screen,\n" +
      "Mirrors the leaves, the buds of green.\n" +
      "For nature's code — the DNA —\n" +
      "Inspires the tech we build today.\n\n" +
      "So let us build with care and grace,\n" +
      "A world where both share the same space.\n\n" +
      "[Demo Response — This is a simulated poem for demonstration purposes.]";
  }

  // Greeting
  if (lower.indexOf('hello') >= 0 || lower.indexOf('hi') >= 0 || lower.indexOf('hey') >= 0) {
    return "Hello! I'm Pallavi AI, your smart assistant. I can help you with:\n\n" +
      "- Explaining programming concepts\n" +
      "- Interview preparation tips\n" +
      "- Creative project ideas\n" +
      "- Writing poems or short texts\n" +
      "- General questions and brainstorming\n\n" +
      "What would you like to know? Just type your question!\n\n" +
      "[Demo Response — Pallavi AI is running in demo mode.]";
  }

  // Who are you
  if (lower.indexOf('who are you') >= 0 || lower.indexOf('what are you') >= 0 || lower.indexOf('your name') >= 0) {
    return "I'm Pallavi AI, a demo chatbot created as a college project. I simulate AI responses to demonstrate a ChatGPT-style chat interface built with HTML, CSS, and JavaScript.\n\n" +
      "I'm not connected to a real AI model — my responses are pre-programmed for demonstration. But I can still help with example topics like Python, interviews, project ideas, and more!\n\n" +
      "[Demo Response — Pallavi AI runs in demo mode.]";
  }

  // Thank you
  if (lower.indexOf('thank') >= 0) {
    return "You're welcome! Feel free to ask me anything else. I'm here to help!\n\n" +
      "[Demo Response — Pallavi AI runs in demo mode.]";
  }

  // Help
  if (lower.indexOf('help') >= 0 && lower.length < 20) {
    return "I'm here to help! Here are some things you can ask me:\n\n" +
      "- \"Explain Python programming\"\n" +
      "- \"Help me prepare for interviews\"\n" +
      "- \"Generate a project idea\"\n" +
      "- \"Write a poem about nature\"\n\n" +
      "Just type your question and press Enter!\n\n" +
      "[Demo Response — Pallavi AI runs in demo mode.]";
  }

  // Default fallback
  return "That's an interesting question! Here's what I think:\n\n" +
    "You asked: \"" + userText + "\"\n\n" +
    "In demo mode, I provide simulated responses to demonstrate the chat interface. My knowledge is limited to a few pre-programmed topics. Try asking me about:\n\n" +
    "- Python programming\n" +
    "- Interview preparation\n" +
    "- Project ideas\n" +
    "- Writing poems\n\n" +
    "To connect a real AI model, an API key and backend integration would be needed.\n\n" +
    "[Demo Response — Pallavi AI runs in demo mode.]";
}

// ==================== INPUT HANDLING ====================
function autoResize() {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

function updateSendButton() {
  var hasText = messageInput.value.trim().length > 0;
  btnSend.disabled = !hasText || isTyping;
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(textarea);
}

// ==================== SIDEBAR (MOBILE) ====================
function openSidebarMobile() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('show');
}

function closeSidebarMobile() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
}

// ==================== EXAMPLE CARDS ====================
function setupExampleCards() {
  var cards = document.querySelectorAll('.example-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      var prompt = card.getAttribute('data-prompt');
      messageInput.value = prompt;
      autoResize();
      updateSendButton();
      sendMessage(prompt);
    });
  });
}

// ==================== EVENT LISTENERS ====================
function setupEvents() {
  // New Chat
  btnNewChat.addEventListener('click', createNewChat);

  // Clear Chat
  btnClearChat.addEventListener('click', clearCurrentChat);

  // Theme toggle
  btnThemeToggle.addEventListener('click', toggleTheme);

  // Send button
  btnSend.addEventListener('click', function() {
    sendMessage(messageInput.value);
  });

  // Input — Enter to send, Shift+Enter for newline
  messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  // Input — auto-resize and update send button
  messageInput.addEventListener('input', function() {
    autoResize();
    updateSendButton();
  });

  // Sidebar mobile
  btnSidebarOpen.addEventListener('click', openSidebarMobile);
  btnSidebarClose.addEventListener('click', closeSidebarMobile);
  sidebarOverlay.addEventListener('click', closeSidebarMobile);

  // Example cards
  setupExampleCards();
}

// ==================== INIT ====================
function init() {
  // Load theme
  applyTheme(loadTheme());

  // Load saved chats
  loadChats();

  // Select most recent chat or show welcome
  if (chats.length > 0) {
    currentChatId = chats[0].id;
  }

  // Setup event listeners
  setupEvents();

  // Render UI
  renderChatHistory();
  renderMessages();

  // Focus input
  messageInput.focus();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
