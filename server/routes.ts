import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { loginSchema, registerSchema, messageSchema, insertOrderSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token eksik' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Geçersiz token' });
    }
    
    // Verify session exists
    const session = await storage.getSession(decoded.sessionToken);
    if (!session) {
      return res.status(403).json({ message: 'Oturum geçersiz' });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(403).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    req.user = user;
    req.sessionToken = decoded.sessionToken;
    next();
  });
}

let io: SocketIOServer;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullanımda" });
      }

      const user = await storage.createUser({
        email: data.email,
        name: data.name,
        password: data.password,
      });

      res.status(201).json({ 
        message: "Kullanıcı başarıyla oluşturuldu",
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.validatePassword(data.email, data.password);
      if (!user) {
        return res.status(401).json({ message: "Geçersiz e-posta veya şifre" });
      }

      const session = await storage.createSession(user.id);
      const token = jwt.sign({ 
        userId: user.id, 
        sessionToken: session.token 
      }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: "Giriş başarılı",
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req: any, res) => {
    try {
      await storage.deleteSession(req.sessionToken);
      res.json({ message: "Çıkış başarılı" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ 
      user: { 
        id: req.user.id, 
        email: req.user.email, 
        name: req.user.name,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt
      } 
    });
  });

  // User routes
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await storage.getUsers(limit);
      res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // System status route
  app.get("/api/system/status", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsers(5);
      const totalUsers = users.length;
      
      res.json({
        status: "healthy",
        database: "connected",
        auth: "active",
        api: "operational",
        stats: {
          totalUsers: totalUsers,
          activeSessions: Math.floor(Math.random() * 100) + 200, // Mock data
          dataRecords: Math.floor(Math.random() * 1000) + 8000, // Mock data
          apiRequests: Math.floor(Math.random() * 10000) + 120000, // Mock data
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV || "development",
          PORT: process.env.PORT || "5000",
          SUPABASE_URL: process.env.SUPABASE_URL?.split('.')[0] + ".supabase.co" || "Not configured"
        }
      });
    } catch (error) {
      console.error("System status error:", error);
      res.status(500).json({ 
        status: "unhealthy",
        message: "Sistem durumu alınamadı" 
      });
    }
  });

  // Orders routes
  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.user.id);
      res.json({ orders });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder({
        ...data,
        buyerId: req.user.id,
      });
      res.status(201).json({ order });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      console.error("Create order error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }
      res.json({ order });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // Messages routes
  app.get("/api/messages/:orderId", authenticateToken, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesByOrder(req.params.orderId);
      
      // Mark messages as read for current user
      await storage.markMessagesAsRead(req.params.orderId, req.user.id);
      
      res.json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const data = messageSchema.parse(req.body);
      
      // Get order to find receiver
      const order = await storage.getOrder(data.orderId);
      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }
      
      const receiverId = order.buyerId === req.user.id ? order.supplierId : order.buyerId;
      
      const message = await storage.createMessage({
        orderId: data.orderId,
        senderId: req.user.id,
        receiverId: receiverId,
        content: data.content,
      });

      // Emit real-time message via WebSocket
      if (io) {
        io.to(`order_${data.orderId}`).emit("new_message", {
          ...message,
          senderName: req.user.name,
        });
        
        io.to(`user_${receiverId}`).emit("message_notification", {
          orderId: data.orderId,
          senderName: req.user.name,
          content: data.content,
        });
      }

      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      console.error("Create message error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get("/api/messages/unread/count", authenticateToken, async (req: any, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("WebSocket user connected:", socket.id);

    // Join user to their personal room
    socket.on("join_user", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join order room for chat
    socket.on("join_order", (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`User joined order room: ${orderId}`);
    });

    // Leave order room
    socket.on("leave_order", (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`User left order room: ${orderId}`);
    });

    // Mark message as read
    socket.on("message_read", async (data) => {
      try {
        await storage.updateMessageStatus(data.messageId, "read");
        socket.to(`order_${data.orderId}`).emit("message_status_update", {
          messageId: data.messageId,
          status: "read"
        });
      } catch (error) {
        console.error("Message read error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket user disconnected:", socket.id);
    });
  });

  return httpServer;
}
