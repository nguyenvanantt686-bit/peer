const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port || 443,
  path: '/peerjs'
});

const chatDiv = document.getElementById('chat');
const statusDiv = document.getElementById('status');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

let connections = []; // lưu các kết nối peer khác

const hubId = 'hub-peer'; // peer đầu tiên là hub
let isHub = false;

peer.on('open', id => {
  statusDiv.innerText = `Your Peer ID: ${id}`;

  if (id === hubId) {
    isHub = true; // peer đầu tiên làm hub
    appendChat("Bạn là Hub. Chờ peer khác kết nối...");
  } else {
    // kết nối tới hub
    const conn = peer.connect(hubId);
    conn.on('open', () => {
      connections.push(conn);
      appendChat(`Đã kết nối tới hub`);
      conn.send({ type: 'join', id });
    });

    conn.on('data', data => handleData(data, conn));
  }
});

// Lắng nghe các kết nối tới hub
peer.on('connection', conn => {
  conn.on('data', data => handleData(data, conn));
  connections.push(conn);
});

// Xử lý tin nhắn nhận được
function handleData(data, conn) {
  if (data.type === 'join' && isHub) {
    // hub nhận peer mới, gửi lại danh sách peer hiện tại
    connections.forEach(c => {
      if (c.peer !== data.id) {
        const newConn = peer.connect(data.id);
        newConn.on('open', () => connections.push(newConn));
        newConn.on('data', d => handleData(d, newConn));
      }
    });
    appendChat(`Peer mới tham gia: ${data.id}`);
  } else if (data.type === 'message') {
    appendChat(`Peer ${data.id}: ${data.msg}`);
  }
}

// Gửi tin nhắn
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (!msg) return;
  connections.forEach(conn => {
    conn.send({ type: 'message', id: peer.id, msg });
  });
  appendChat(`Bạn: ${msg}`);
  messageInput.value = '';
});

// Thêm tin nhắn vào chatDiv
function appendChat(msg) {
  const p = document.createElement('p');
  p.textContent = msg;
  chatDiv.appendChild(p);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
