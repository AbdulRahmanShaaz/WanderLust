// script.js – panel toggles & placeholder chat logic

document.addEventListener('DOMContentLoaded', () => {
  const explorerBtn = document.getElementById('explorerToggle');
  const terminalBtn = document.getElementById('terminalToggle');
  const sideBar = document.getElementById('sideBar');
  const terminalPanel = document.getElementById('terminalPanel');

  // Toggle side bar visibility
  explorerBtn.addEventListener('click', () => {
    sideBar.classList.toggle('hidden');
  });

  // Toggle terminal panel visibility
  terminalBtn.addEventListener('click', () => {
    terminalPanel.classList.toggle('hidden');
  });

  // Simple chat placeholder logic
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const messagesDiv = document.getElementById('messages');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    appendMessage('You', text, true);
    // Placeholder response – echo back after a short delay
    setTimeout(() => {
      appendMessage('Antigravity', `Echo: ${text}`, false);
    }, 500);
    messageInput.value = '';
  });
});

function appendMessage(sender, text, isUser) {
  const msgEl = document.createElement('div');
  msgEl.classList.add('message');
  msgEl.classList.add(isUser ? 'user-msg' : 'bot-msg');
  msgEl.innerHTML = `<strong>${sender}:</strong> ${escapeHtml(text)}`;
  const container = document.getElementById('messages');
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (tag) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return map[tag] || tag;
  });
}
