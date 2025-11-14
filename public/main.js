// Tạo peer mới
const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port || 443,
  path: '/peerjs'
});

peer.on('open', id => {
  document.getElementById('status').innerText = `Peer ID của bạn: ${id}`;
});

// Kết nối đến peer khác
document.getElementById('connect-btn').addEventListener('click', () => {
  const peerId = document.getElementById('peer-id').value;
  if (!peerId) return alert("Nhập Peer ID để kết nối!");
  const conn = peer.connect(peerId);

  conn.on('open', () => {
    conn.send('Hello từ ' + peer.id);
    conn.on('data', data => {
      alert("Received: " + data);
    });
  });
});
