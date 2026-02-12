const socket = io();
let myId = "";

function startChat(userId) {
  myId = userId;
  document.getElementById('display-name').innerText = myId;
  document.getElementById('entry-container').style.display = 'none';
  document.getElementById('chat-container').style.display = 'flex';
  document.getElementById('m-input').focus();
}

// 수동 로그인 로직
function handleLogin() {
  const username = document.getElementById('login-user').value;
  if(!username.trim()) return alert("입장할 이름을 입력해주세요.");
  startChat(username.trim());
}

// 페이지 로드 시 SSO 유저 정보 확인 후 자동 입장 시도
window.onload = async () => {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    
    // 유저 정보가 'Guest'가 아니거나 정상적인 아이디라면 자동 입장
    if (data.username && data.username !== 'Guest' && data.username !== 'Unknown') {
      console.log("SSO 로그인 확인:", data.username);
      startChat(data.username);
    }
  } catch (err) {
    console.error("유저 정보 로드 실패:", err);
  }
};

// 메시지 전송
document.getElementById('chat-form').onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById('m-input');
  if (input.value.trim().length > 0) {
    socket.emit('chat message', { text: input.value, senderId: myId });
    input.value = '';
  }
};

// 메시지 수신
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  
  if (data.type === 'system') {
    // 시스템 메시지 스타일 (가운데 정렬, 회색 글씨 등)
    li.className = 'system-msg';
    li.innerHTML = `<span>${data.text}</span>`;
  } else {
    // 일반 메시지 스타일 (기존 로직)
    li.className = data.senderId === myId ? 'my-msg' : 'other-msg';
    li.innerHTML = `<strong>${data.senderId}:</strong> ${data.text}`;
  }
  
  const msgList = document.getElementById('messages');
  msgList.appendChild(li);
  msgList.scrollTop = msgList.scrollHeight;
});

function startChat(userId) {
  myId = userId;
  // 서버에 나를 등록 (추가된 부분)
  socket.emit('register user', myId);
  
  document.getElementById('display-name').innerText = myId;
  document.getElementById('entry-container').style.display = 'none';
  document.getElementById('chat-container').style.display = 'flex';
  document.getElementById('m-input').focus();
}

// 서버로부터 접속자 명단을 수신
socket.on('user list', (users) => {
  const userListElement = document.getElementById('user-list'); // HTML에 추가 필요
  userListElement.innerHTML = ''; // 초기화
  
  // 중복 제거 후 출력
  const uniqueUsers = [...new Set(users)];
  uniqueUsers.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `🟢 ${user}`;
    userListElement.appendChild(li);
  });
});
