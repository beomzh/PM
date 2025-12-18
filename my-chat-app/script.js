var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
var messages = document.getElementById('messages');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function(data) {
  var item = document.createElement('li');
  item.textContent = data.text;
  
  if (data.senderId === socket.id) {
    item.classList.add('me');
  } else {
    item.classList.add('other');
  }
  
  messages.appendChild(item);
  messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
});
