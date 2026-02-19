const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ['websocket'] // 400 에러 방지를 위해 웹소켓 고정
});
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// --- PostgreSQL 설정 ---
const pool = new Pool({
  host: process.env.DB_HOST || 'db-service',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'chatdb',
  port: 5432,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ PostgreSQL Table Initialized");
  } catch (err) {
    console.error("❌ DB 초기화 실패:", err);
  }
};

// --- Kafka 설정 ---
const kafka = new Kafka({
  clientId: 'chat-server',
  brokers: [process.env.KAFKA_BROKER || 'redpanda.chat.svc.cluster.local:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: `chat-group-${process.env.HOSTNAME || 'local'}` }); 

let globalConnectedUsers = {};

const initKafka = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topics: ['chat-messages', 'chat-events'], fromBeginning: false });

  console.log("✅ Kafka Producer & Consumer Connected");

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      
      if (topic === 'chat-messages') {
        const { text, senderId } = data;
        // 1. DB 저장
        try {
          await pool.query('INSERT INTO messages (sender_id, text) VALUES ($1, $2)', [senderId, text]);
        } catch (err) { console.error("DB 저장 오류:", err); }

        // 2. 전체 소켓 전송
        io.emit('chat message', { text, senderId });
      } 
      else if (topic === 'chat-events') {
        if (data.type === 'JOIN') {
          globalConnectedUsers[data.username] = (globalConnectedUsers[data.username] || 0) + 1;
        } else if (data.type === 'LEAVE') {
          if (globalConnectedUsers[data.username] > 0) {
            globalConnectedUsers[data.username]--;
            if (globalConnectedUsers[data.username] === 0) delete globalConnectedUsers[data.username];
          }
        }
        io.emit('user list', Object.keys(globalConnectedUsers));
        io.emit('chat message', { type: 'system', text: data.text });
      }
    },
  });
};

initDB().then(() => initKafka()).catch(console.error);

// --- API ---
app.get('/api/user', (req, res) => {
  const username = req.headers['x-auth-request-user'] || 'Guest';
  res.json({ username });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- Socket.io ---
io.on('connection', async (socket) => {
  console.log("🔌 New Socket Connection:", socket.id);
  
  // 1. DB에서 과거 내역 가져와서 전송
  try {
    const res = await pool.query('SELECT sender_id as "senderId", text FROM messages ORDER BY created_at DESC LIMIT 50');
    socket.emit('history', res.rows.reverse());
  } catch (err) { console.error("히스토리 조회 실패:", err); }
  
  socket.on('register user', async (username) => {
    socket.username = username;
    await producer.send({
      topic: 'chat-events',
      messages: [{ value: JSON.stringify({ type: 'JOIN', username: username, text: `${username}님이 입장하셨습니다.` })}]
    });
  });

  socket.on('chat message', async (data) => {
    if (!data.text || data.text.length > 500) return;
    try {
      await producer.send({
        topic: 'chat-messages',
        messages: [{ key: data.senderId, value: JSON.stringify({ senderId: data.senderId, text: data.text }) }],
      });
    } catch (err) { console.error("Kafka 전송 실패:", err); }
  });

  socket.on('disconnect', async () => {
    if (socket.username) {
      await producer.send({
        topic: 'chat-events',
        messages: [{ value: JSON.stringify({ type: 'LEAVE', username: socket.username, text: `${socket.username}님이 퇴장하셨습니다.` })}]
      });
    }
  });
});

server.listen(port, '0.0.0.0', () => console.log(`🚀 Chat Server running on port ${port}`));
