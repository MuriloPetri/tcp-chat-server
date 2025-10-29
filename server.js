// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public')); // serve index.html, client.js, style.css em /public

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// === MAPA DE CLIENTES CONECTADOS ===
const clients = new Map();

// === EVENTOS PRINCIPAIS DO SOCKET.IO ===
io.on('connection', (socket) => {
  console.log(`🟢 Socket conectado: ${socket.id}`);
  io.emit('admin-log', `🟢 Cliente conectado: ${socket.id}`);

  // cliente envia apelido ao entrar
  socket.on('join', (nickname) => {
    const nick = (nickname && nickname.trim()) ? nickname.trim() : 'Usuário';
    clients.set(socket.id, nick);
    const joinMsg = `🔵 ${nick} entrou no chat!`;
    io.emit('system', joinMsg);
    io.emit('admin-clients', Array.from(clients.values()));
    io.emit('admin-log', joinMsg);
    console.log(`${nick} (${socket.id}) entrou`);
  });

  // quando o cliente envia mensagem
  socket.on('message', (text) => {
    const nick = clients.get(socket.id) || 'Desconhecido';
    const full = `[${nick}] ${text}`;
    io.emit('message', full);
    io.emit('admin-log', full);
    console.log(full);
  });

  // cliente desconectado
  socket.on('disconnect', () => {
    const nick = clients.get(socket.id) || 'Desconhecido';
    clients.delete(socket.id);
    const leaveMsg = `🔴 ${nick} saiu do chat.`;
    io.emit('system', leaveMsg);
    io.emit('admin-clients', Array.from(clients.values()));
    io.emit('admin-log', leaveMsg);
    console.log(`${nick} (${socket.id}) desconectado`);
  });

  // broadcast manual pelo painel admin
  socket.on('admin-broadcast', (msg) => {
    io.emit('system', `[SERVIDOR] ${msg}`);
    io.emit('admin-log', `📢 Broadcast enviado: ${msg}`);
    console.log(`[SERVIDOR] ${msg}`);
  });
});

// === INÍCIO DO SERVIDOR ===
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
