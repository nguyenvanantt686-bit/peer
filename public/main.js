const chatDiv = document.getElementById('chat');
const statusDiv = document.getElementById('status');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

const connections = {}; // lưu kết nối peer khác
let peers = new Set();  // lưu peer id đã biết

// Tạo Peer client, connect tới hub PeerJS server trên Render
const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port || 443,
  path: '/peerjs/myapp'
});

// Khi peer mở kết nối thành công
peer.on('open', id => {
  statusDiv.innerText = `Your Peer ID: ${id}`;
  // thông báo join tới tất cả peer cũ
  broadcast({ type: 'join', id });
});

// Lắng nghe kết nối từ peer khác
peer.on('connection', conn => {
  setupConnection(conn);
});

// Thiết lập kết nối an toàn
function setupConnection(conn) {
  connections[conn.peer] = conn;
  peers.add(conn.peer);

  // Chỉ gửi dữ liệu khi connection đã open
  conn.on('open', () => {
    console.log(`Connected to ${conn.peer}`);
  });

  conn.on('data', data => {
    if (data.type === 'message') appendChat(`${data.id}: ${data.msg}`);
    else if (data.type === 'join' && data.id !== peer.id) {
      // Nếu chưa kết nối với peer mới, connect ngay
      if (!connections[data.id]) {
        const newConn = peer.connect(data.id);
        setupConnection(newConn);
      }
    }
  });

  conn.on('close', () => {
    console.log(`Disconnected from ${conn.peer}`);
    delete connections[conn.peer];
    peers.delete(conn.peer);
  });
}

// Gửi dữ liệu tới tất cả peer kết nối
function broadcast(data) {
  Object.values(connections).forEach(conn => {
    if (conn.open) {
      conn.send(data);
    }
  });
}

// Gửi tin nhắn khi nhấn nút
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
