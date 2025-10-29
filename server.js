// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public')); // serve index.html, client.js, style.css em /public

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// Map para guardar apelidos por socket.id
const clients = new Map();

io.on('connection', (socket) => {
  console.log(`🔗 Socket conectado: ${socket.id}`);

  // cliente envia apelido ao "entrar"
  socket.on('join', (nickname) => {
    const nick = (nickname && nickname.trim()) ? nickname.trim() : 'Usuário';
    clients.set(socket.id, nick);
    const joinMsg = `🔵 ${nick} entrou no chat!`;
    io.emit('system', joinMsg);
    console.log(`👤 ${nick} (${socket.id}) entrou`);
  });

  // quando chega uma mensagem do cliente
  socket.on('message', (text) => {
    const nick = clients.get(socket.id) || 'Desconhecido';
    const full = `💬[${nick}] ${text}`;
    io.emit('message', full);
    console.log(full);
  });

  // limpeza na desconexão
  socket.on('disconnect', () => {
    const nick = clients.get(socket.id) || 'Desconhecido';
    clients.delete(socket.id);
    const leaveMsg = `🔴 ${nick} saiu do chat.`;
    io.emit('system', leaveMsg);
    console.log(`${nick} (${socket.id}) desconectado`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
