import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { notificationRoutes } from "./routes/notifications.js";
import { orderRoutes } from "./routes/orders.js";
import { productRoutes } from "./routes/products.js";
import { authRoutes } from "./routes/auth.js";
import { messageRoutes } from "./routes/messages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// HTTP sunucusu oluştur
const httpServer = createServer(app);

// WebSocket sunucusu oluştur
const wss = new WebSocketServer({ 
  server: httpServer, 
  path: '/ws' 
});

// WebSocket bağlantıları için kullanıcı haritası
const userConnections = new Map<string, WebSocket>();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist/public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/public/index.html"));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// WebSocket bağlantı yönetimi
wss.on('connection', (ws: WebSocket, req) => {
  console.log('Yeni WebSocket bağlantısı');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      
      // Kullanıcı kayıt et
      if (data.type === 'register' && data.userId) {
        userConnections.set(data.userId, ws);
        console.log(`Kullanıcı ${data.userId} WebSocket'e kayıt oldu`);
        
        ws.send(JSON.stringify({
          type: 'registered',
          message: 'WebSocket bağlantısı başarılı'
        }));
      }
      
      // Mesaj gönder
      if (data.type === 'message' && data.receiverId && data.content) {
        const receiverWs = userConnections.get(data.receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify({
            type: 'new_message',
            senderId: data.senderId,
            chatRoomId: data.chatRoomId,
            content: data.content,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('WebSocket mesaj işleme hatası:', error);
    }
  });

  ws.on('close', () => {
    // Kullanıcı bağlantısını kaldır
    for (const [userId, connection] of userConnections.entries()) {
      if (connection === ws) {
        userConnections.delete(userId);
        console.log(`Kullanıcı ${userId} WebSocket bağlantısı kapandı`);
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket hatası:', error);
  });
});

// WebSocket yardımcı fonksiyonu dışa aktar
export const broadcastToUser = (userId: string, message: any) => {
  const ws = userConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    return true;
  }
  return false;
};

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 WebSocket server running on ws://0.0.0.0:${PORT}/ws`);
});