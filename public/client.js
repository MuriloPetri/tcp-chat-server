(() => {
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const nicknameInput = document.getElementById('nickname');
  const statusSpan = document.getElementById('status');
  const chatArea = document.getElementById('chatArea');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');

  // painel do servidor
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdmin = document.getElementById('closeAdmin');
  const connectedList = document.getElementById('connectedList');
  const serverLogs = document.getElementById('serverLogs');

  let socket = null;
  let connected = false;

  // ===== Funções utilitárias =====
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

  // ===== Conectar =====
  connectBtn.addEventListener('click', () => {
    if (connected) return;
    const nickname = nicknameInput.value.trim() || 'Usuário';

    socket = io();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', nickname);
      logSystem(`✅ Conectado ao servidor (socket id: ${socket.id})`);

      // Atualiza o painel também
      socket.emit('getClients');
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      logSystem(`🔴 Desconectado: ${reason}`);
      socket = null;
    });

    socket.on('system', (text) => {
      logSystem(text);
      addLog(text); // também manda pro painel
    });

    socket.on('message', (text) => {
      logMessage(text);
      addLog(text, '#a3e635'); // também mostra no painel
    });

    socket.on('clients', (list) => {
      updateConnectedList(list);
    });

    socket.on('connect_error', (err) => {
      logSystem('Erro de conexão: ' + (err && err.message ? err.message : err));
    });
  });

  // ===== Desconectar =====
  disconnectBtn.addEventListener('click', () => {
    if (!socket) return;
    socket.disconnect();
    setConnected(false);
    logSystem('🔴 Você desconectou manualmente.');
  });

  // ===== Enviar mensagem =====
  function sendMessage() {
    const text = msgInput.value.trim();
    if (!text || !socket) return;
    socket.emit('message', text);
    msgInput.value = '';
  }

  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // ===== Painel do Servidor =====
  function updateConnectedList(list) {
    connectedList.innerHTML = '';
    list.forEach((nick) => {
      const li = document.createElement('li');
      li.textContent = nick;
      connectedList.appendChild(li);
    });
  }

  const addLog = (msg, color = '#fff') => {
    const div = document.createElement('div');
    div.innerHTML = `<span style="color:${color}">${msg}</span>`;
    serverLogs.appendChild(div);
    serverLogs.scrollTop = serverLogs.scrollHeight;
  };

  adminBtn.addEventListener('click', () => {
    adminModal.classList.toggle('hidden');
    if (!adminModal.classList.contains('hidden') && socket) {
      socket.emit('getClients');
    }
  });

  closeAdmin.addEventListener('click', () => {
    adminModal.classList.add('hidden');
  });

  // ===== Estado inicial =====
  setConnected(false);
})();
