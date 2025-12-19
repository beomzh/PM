const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port=3000;

const { Pool } = require('pg');

// DB postgres 연결 설정
// port는 manifest/db/postgres.sh 에서 포워딩한 5433 포트를 사용
// host 이름은 컨테이너 이름인 pg-temp 로 설정
const pool = new Pool({
  user: 'postgres',
  host: 'postgres', 
  database: 'chat_db',
  password: 'temp_password',
  port: 5432, 
});

const initDb = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableQuery);
  console.log("✅ DB 테이블 준비 완료");
};
initDb();

// 모든 정적 파일 제공
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', async (socket) => {
  console.log('유저 접속:', socket.id);

  // 접속 시 이전 대화 내역 불러오기 (최근 50개)
  try {
    const res = await pool.query('SELECT sender_id, message FROM messages ORDER BY created_at ASC LIMIT 50');
    res.rows.forEach((row) => {
      socket.emit('chat message', { text: row.message, senderId: row.sender_id });
    });
  } catch (err) {
    console.error('이전 메시지 로드 실패:', err);
  }

  
  socket.on('chat message', async (msg) => {
    try {
      // DB에 저장
      await pool.query('INSERT INTO messages (sender_id, message) VALUES ($1, $2)', [socket.id, msg]);
      
      // 모든 유저에게 전송
      io.emit('chat message', { text: msg, senderId: socket.id });
    } catch (err) {
      console.error('메시지 저장 실패:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('유저 퇴장');
  });
});

server.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`); 
});
