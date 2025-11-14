const chatDiv = document.getElementById('chat');
const statusDiv = document.getElementById('status');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

const connections = {}; // lưu các kết nối peer khác

// Tạo Peer client, connect tới hub PeerJS server trên Render
const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port || 443,
  path: '/peerjs/myapp'
});

peer.on('open', id => {
  statusDiv.innerText = `Your Peer ID: ${id}`;
  broadcast({ type: 'join', id });
});

// Lắng nghe kết nối đến
peer.on('connection', conn => {
  setupConnection(conn);
});

function setupConnection(conn) {
  connections[conn.peer] = conn;

  conn.on('data', data => {
    if (data.type === 'message') appendChat(`${data.id}: ${data.msg}`);
    else if (data.type === 'join' && data.id !== peer.id) {
      if (!connections[data.id]) {
        const newConn = peer.connect(data.id);
        setupConnection(newConn);
      }
    }
  });
}

// Gửi dữ liệu tới tất cả peer kết nối
function broadcast(data) {
  Object.values(connections).forEach(conn => conn.send(data));
}

// Gửi tin nhắn
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (!msg) return;
  broadcast({ type: 'message', id: peer.id, msg });
  appendChat(`Bạn: ${msg}`);
  messageInput.value = '';
});

// Thêm tin nhắn vào chat
function appendChat(msg) {
  const p = document.createElement('p');
  p.textContent = msg;
  chatDiv.appendChild(p);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
