// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public')); // serve index.html, client.js, style.css em /public

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// Mapa para guardar apelidos
const clients = new Map();

// ========== LADO CLIENTE ==========
io.on('connection', (socket) => {
  console.log(`🔗 Socket conectado: ${socket.id}`);

  socket.on('join', (nickname) => {
    const nick = (nickname && nickname.trim()) ? nickname.trim() : 'Usuário';
    clients.set(socket.id, nick);
    const joinMsg = `🔵 ${nick} entrou no chat!`;
    io.emit('system', joinMsg);
    console.log(`👤 ${nick} (${socket.id}) entrou`);
    io.emit('clients', Array.from(clients.values()));
  });

  socket.on('message', (text) => {
    const nick = clients.get(socket.id) || 'Desconhecido';
    const msg = `💬 [${nick}] ${text}`;
    io.emit('message', msg);
    console.log(msg);
  });

  socket.on('disconnect', () => {
    const nick = clients.get(socket.id) || 'Desconhecido';
    clients.delete(socket.id);
    const leaveMsg = `🔴 ${nick} saiu do chat.`;
    io.emit('system', leaveMsg);
    console.log(`${nick} (${socket.id}) desconectado`);
    io.emit('clients', Array.from(clients.values()));
  });

  // 👇 bloco certo: dentro do connection
  socket.on('getClients', () => {
    socket.emit('clients', Array.from(clients.values()));
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
