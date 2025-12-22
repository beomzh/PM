const socket = io();
let myId = "";

function showSection(id) {
  document.getElementById('menu-buttons').style.display = 'none';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('signup-section').style.display = 'none';
  document.getElementById(id).style.display = 'block';
}

function startChat(userId) {
  myId = userId;
  document.getElementById('display-name').innerText = myId;
  
  // 모든 입장 화면 숨기기
  document.getElementById('entry-container').style.display = 'none';
  // 채팅창 보이기
  document.getElementById('chat-container').style.display = 'flex';
  
  document.getElementById('m-input').focus();
}

// 회원가입
async function handleSignup() {
  const username = document.getElementById('reg-user').value;
  const password = document.getElementById('reg-pass').value;
  const res = await fetch('/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if(data.success) {
    alert("가입 성공!");
    startChat(username);
  } else alert(data.message);
}

// 로그인
async function handleLogin() {
  const username = document.getElementById('login-user').value;
  const password = document.getElementById('login-pass').value;
  const res = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if(data.success) {
    startChat(data.username);
  } else alert(data.message);
}

function enterAsGuest() {
  startChat("Guest_" + Math.floor(Math.random()*1000));
}

// 전송
document.getElementById('chat-form').onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById('m-input');
  const sendBtn = e.target.querySelector('button');

  if (input.value.trim().length > 0) {
    socket.emit('chat message', { text: input.value, senderId: myId });
    
    // 전송 후 0.5초간 버튼 비활성화 (도배 방지 시각화)
    input.value = '';
    sendBtn.disabled = true;
    setTimeout(() => { sendBtn.disabled = false; }, 100);
  }
};

// 수신
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  li.className = data.senderId === myId ? 'my-msg' : 'other-msg';
  li.innerHTML = `<strong>${data.senderId}:</strong> ${data.text}`;
  const msgList = document.getElementById('messages');
  msgList.appendChild(li);
  msgList.scrollTop = msgList.scrollHeight; // 자동 스크롤
});
