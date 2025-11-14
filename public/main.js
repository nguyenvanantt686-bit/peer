const chatDiv = document.getElementById('chat');
const statusDiv = document.getElementById('status');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

const connections = {}; // lưu kết nối đến các peer

// Tạo peer mới trên client, connect tới hub server
const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port || 443,
  path: '/peerjs/myapp'
});

peer.on('open', id => {
  statusDiv.innerText = `Your Peer ID: ${id}`;
  broadcast({ type: 'join', id });
});

// Khi có kết nối từ peer khác
peer.on('connection', conn => {
  setupConnection(conn);
});

// Thiết lập sự kiện cho một kết nối
function setupConnection(conn) {
  connections[conn.peer] = conn;

  conn.on('data', data => {
    if (data.type === 'message') appendChat(`${data.id}: ${data.msg}`);
    else if (data.type === 'join' && data.id !== peer.id) {
      // khi peer mới join, kết nối lại với họ nếu chưa kết nối
      if (!connections[data.id]) {
        const newConn = peer.connect(data.id);
        setupConnection(newConn);
      }
    }
  });
}

// Gửi dữ liệu đến tất cả peer đã kết nối
function broadcast(data) {
  Object.values(connections).forEach(conn => conn.send(data));
}

// Gửi tin nhắn khi nhấn button
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (!msg) return;
  broadcast({ type: 'message', id: peer.id, msg });
  appendChat(`Bạn: ${msg}`);
  messageInput.value = '';
});

// Thêm tin nhắn vào chat div
function appendChat(msg) {
  const p = document.createElement('p');
  p.textContent = msg;
  chatDiv.appendChild(p);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
