import express from "express";
import cors from "cors";
import { ExpressPeerServer } from "peer";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files từ thư mục public
app.use(express.static(path.join(__dirname, "public")));

// PeerJS server
const httpServer = createServer(app);
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
  path: "/myapp"
});
app.use("/peerjs", peerServer);

// Start server trên port của Render
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
