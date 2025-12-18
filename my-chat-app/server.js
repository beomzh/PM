const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port=3000;

// 모든 정적 파일 제공
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('유저 입장:', socket.id);
  // 입장시 헤더 로그 출력
  const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] === REQUEST HEADERS RECEIVED ===`);
    console.log(JSON.stringify(socket.headers, null, 2)); 
    console.log('==============================================\n');

  // 메시지 수신
  socket.on('chat message', (msg) => {
    // 메시지와 함께 보낸 사람의 고유 ID를 모든 클라이언트에 전송
    io.emit('chat message', { 
      text: msg, 
      senderId: socket.id 
    });
  });

  socket.on('disconnect', () => {
    console.log('유저 퇴장:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`); 
});
