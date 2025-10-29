// client.js
(() => {
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const nicknameInput = document.getElementById('nickname');
  const statusSpan = document.getElementById('status');
  const chatArea = document.getElementById('chatArea');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');

  let socket = null;
  let connected = false;

  function logSystem(text) {
    const d = document.createElement('div');
    d.className = 'system';
    d.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  function logMessage(text) {
    const d = document.createElement('div');
    d.className = 'msg';
    d.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function setConnected(isConnected) {
    connected = isConnected;
    nicknameInput.disabled = isConnected;
    connectBtn.disabled = isConnected;
    disconnectBtn.disabled = !isConnected;
    msgInput.disabled = !isConnected;
    sendBtn.disabled = !isConnected;
    statusSpan.textContent = isConnected ? '🟢 Conectado' : '🔴 Desconectado';
    statusSpan.className = isConnected ? 'status connected' : 'status disconnected';
  }

  connectBtn.addEventListener('click', () => {
    if (connected) return;
    const nickname = nicknameInput.value.trim() || 'Usuário';

    // conecta ao mesmo host/origem que serviu a página
    socket = io();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', nickname);
      logSystem(`✅ Conectado ao servidor (socket id: ${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      logSystem(`🔴 Desconectado: ${reason}`);
      socket = null;
    });

    socket.on('system', (text) => {
      logSystem(text);
    });

    socket.on('message', (text) => {
      logMessage(text);
    });

    // tratar erro de conexão
    socket.on('connect_error', (err) => {
      logSystem('Erro de conexão: ' + (err && err.message ? err.message : err));
    });
  });

  disconnectBtn.addEventListener('click', () => {
    if (!socket) return;
    socket.disconnect();
    setConnected(false);
    logSystem('🔴 Você desconectou manualmente.');
  });

  function sendMessage() {
    const text = msgInput.value.trim();
    if (!text || !socket) return;
    socket.emit('message', text);
    msgInput.value = '';
  }

  // Enter para enviar
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // estado inicial
  setConnected(false);
})();
