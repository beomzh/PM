const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const { Kafka } = require('kafkajs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// --- Kafka 설정 ---
const kafka = new Kafka({
  clientId: 'chat-server',
  brokers: [process.env.KAFKA_BROKER || 'redpanda.chat.svc.cluster.local:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: `chat-group-${Math.random()}` }); 

let globalConnectedUsers = {};
const messageHistory = []; // 과거 내역 저장용
const lastMessageTimes = new Map();

const initKafka = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topics: ['chat-messages', 'chat-events'], fromBeginning: false });

  console.log("✅ Kafka Producer & Consumer Connected");

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      
      if (topic === 'chat-messages') {
        const msgData = { text: data.text, senderId: data.senderId };
        // 📢 메시지 히스토리 업데이트 (최근 50개)
        messageHistory.push(msgData);
        if (messageHistory.length > 50) messageHistory.shift();

        io.emit('chat message', msgData);
      } 
      else if (topic === 'chat-events') {
        if (data.type === 'JOIN') {
          globalConnectedUsers[data.username] = (globalConnectedUsers[data.username] || 0) + 1;
        } 
        else if (data.type === 'LEAVE') {
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

initKafka().catch(console.error);

// --- API ---
app.get('/api/user', (req, res) => {
  const username = req.headers['x-auth-request-user'] || 'Guest';
  res.json({ username });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- Socket.io ---
io.on('connection', (socket) => {
  // 접속하자마자 메모리에 있는 과거 내역 전송
  messageHistory.forEach((msg) => socket.emit('chat message', msg));
  
  socket.on('register user', async (username) => {
    socket.username = username;
    await producer.send({
      topic: 'chat-events',
      messages: [{ value: JSON.stringify({ 
        type: 'JOIN', 
        username: username,
        text: `${username}님이 입장하셨습니다.` 
      })}]
    });
  });

  socket.on('chat message', async (data) => {
    const now = Date.now();
    const lastTime = lastMessageTimes.get(socket.id) || 0;
    if (now - lastTime < 100) return;
    if (!data.text || data.text.length > 500) return;
    lastMessageTimes.set(socket.id, now);
    
    try {
      await producer.send({
        topic: 'chat-messages',
        messages: [{ key: 'default-room', value: JSON.stringify({
          senderId: data.senderId,
          text: data.text
        }) }],
      });
    } catch (err) {
      console.error("Kafka 전송 실패:", err);
    }
  });

  socket.on('disconnect', async () => {
    lastMessageTimes.delete(socket.id); // 도배 방지 맵 정리
    if (socket.username) {
      await producer.send({
        topic: 'chat-events',
        messages: [{ value: JSON.stringify({ 
          type: 'LEAVE', 
          username: socket.username,
          text: `${socket.username}님이 퇴장하셨습니다.` 
        })}]
      });
    }
  });
});

server.listen(port, () => console.log(`🚀 Chat Server running on port ${port}`));
