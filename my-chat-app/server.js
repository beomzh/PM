const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const bcrypt = require('bcrypt');


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port=3000;

const { Pool } = require('pg');

// 모든 정적 파일 제공
app.use(express.json());
app.use(express.static(__dirname));

// DB postgres 연결 설정
// port는 manifest/db/postgres.sh 에서 포워딩한 5433 포트를 사용
// host 이름은 컨테이너 이름인 pg-temp 로 설정
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'postgres-service', // 환경변수 DB_HOST 읽기
  database: process.env.DB_NAME || 'chat_db',
  password: process.env.DB_PASSWORD || 'temp_password',
  port: process.env.DB_PORT || 5432,
});

// 테이블 초기화 로직 업데이트
const initDb = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createUsersTable);
  await pool.query(createMessagesTable);
  console.log("✅ DB 테이블 준비 완료 (users, messages)");
};
initDb();


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 전송 도배 방지를 위한 맵 (메모리 저장)
const lastMessageTimes = new Map();

io.on('connection', async (socket) => {
  console.log('유저 접속:', socket.id);

  // 접속 직후 이전 메시지 내역(최근 50개)을 불러와서 전송
  try {
    const history = await pool.query(
      'SELECT sender_id, message FROM messages ORDER BY created_at ASC LIMIT 50'
    );
    // 새로 접속한 해당 소켓(유저)에게만 과거 내역 전송
    history.rows.forEach((row) => {
      socket.emit('chat message', { text: row.message, senderId: row.sender_id });
    });
  } catch (err) {
    console.error('이전 메시지 로드 실패:', err);
  }

  socket.on('chat message', async (data) => {
    const now = Date.now();
    const lastTime = lastMessageTimes.get(socket.id) || 0;

    // 1. 도배 방지: 0.5초 이내 재전송 차단
    if (now - lastTime < 500) {
      return socket.emit('error message', '메시지를 너무 빨리 보낼 수 없습니다.');
    }

    // 2. 글자 수 상한선: 500자 제한
    if (!data.text || data.text.length > 500) {
      return socket.emit('error message', '메시지는 1자 이상 500자 이하로 입력해주세요.');
    }

    try {
      lastMessageTimes.set(socket.id, now);
      await pool.query(
        'INSERT INTO messages (sender_id, message) VALUES ($1, $2)', 
        [data.senderId, data.text]
      );
      io.emit('chat message', data);
    } catch (err) {
      console.error('메시지 저장 실패:', err);
    }
  });

  socket.on('disconnect', () => {
    lastMessageTimes.delete(socket.id);
  });
});


// --- 회원가입 API ---
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. 중복 유저 확인
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: '이미 존재하는 아이디입니다.' });
    }

    // 2. 비밀번호 해싱 (암호화)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. DB 저장
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    res.status(201).json({ success: true, message: '회원가입 성공!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 에러 발생' });
  }
});

// --- 로그인 API 추가 ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "존재하지 않는 아이디입니다." });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({ success: true, username: user.username });
    } else {
      res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "서버 에러" });
  }
});

server.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`); 
});
