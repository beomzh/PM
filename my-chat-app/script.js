const socket = io({
  transports: ['websocket'],
  upgrade: false
});

let myId = "";

function renderMessage(data) {
  const li = document.createElement('li');
  const msgList = document.getElementById('messages');

  if (data.type === 'system') {
    li.className = 'system-msg';
    li.innerHTML = `<span>${data.text}</span>`;
  } else {
    li.className = data.senderId === myId ? 'my-msg' : 'other-msg';
    li.innerHTML = `<strong>${data.senderId}:</strong> ${data.text}`;
  }
  
  msgList.appendChild(li);
  msgList.scrollTop = msgList.scrollHeight;
}

// 과거 내역 수신
socket.on('history', (history) => {
  const msgList = document.getElementById('messages');
  msgList.innerHTML = ''; 
  history.forEach(msg => renderMessage(msg));
});

// 실시간 메시지 수신
socket.on('chat message', (data) => {
  renderMessage(data);
});

// 접속자 명단 토글 함수
function toggleUserList() {
  const container = document.getElementById('user-list-container');
  if (container.style.display === 'none') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

// 서버로부터 접속자 명단 수신 로직 업데이트
socket.on('user list', (users) => {
  const userCountElement = document.getElementById('user-count');
  const userListElement = document.getElementById('user-list');
  
  if (!userCountElement || !userListElement) return;

  // 1. 중복 제거된 유저 리스트 생성
  const uniqueUsers = [...new Set(users)];
  
  // 2. 접속자 수 업데이트
  userCountElement.innerText = uniqueUsers.length;

  // 3. 실제 명단 업데이트
  userListElement.innerHTML = '';
  uniqueUsers.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `🟢 ${user}`;
    userListElement.appendChild(li);
  });
});

function startChat(userId) {
  myId = userId;
  socket.emit('register user', myId);
  document.getElementById('display-name').innerText = myId;
  document.getElementById('entry-container').style.display = 'none';
  document.getElementById('chat-container').style.display = 'flex';
  document.getElementById('m-input').focus();
}

function handleLogin() {
  const username = document.getElementById('login-user').value;
  if(!username.trim()) return alert("입장할 이름을 입력해주세요.");
  startChat(username.trim());
}

window.onload = async () => {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    if (data.username && !['Guest', 'Unknown'].includes(data.username)) {
      startChat(data.username);
    }
  } catch (err) { console.error("유저 정보 로드 실패:", err); }
};

document.getElementById('chat-form').onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById('m-input');
  if (input.value.trim().length > 0) {
    socket.emit('chat message', { text: input.value, senderId: myId });
    input.value = '';
  }
};
