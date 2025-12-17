const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Express 앱을 기반으로 HTTP 서버 생성
const io = new Server(server); // 그 위에 Socket.io 서버를 얹음

// 1. 프론트엔드 파일(index.html) 보여주기
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 2. 소켓 연결 로직 (핵심!)
io.on('connection', (socket) => {
  console.log('유저가 입장했습니다.');

  // 클라이언트로부터 'chat message'라는 이름으로 메시지를 받으면
  socket.on('chat message', (msg) => {
    // 접속한 모든 사람(나 포함)에게 'chat message'로 다시 보냄
    io.emit('chat message', msg); 
  });

  // 연결이 끊어졌을 때
  socket.on('disconnect', () => {
    console.log('유저가 퇴장했습니다.');
  });
});

// 3. 서버 실행 (3000번 포트)
server.listen(3000, () => {
  console.log('채팅 서버가 3000번 포트에서 실행 중입니다.');
});
