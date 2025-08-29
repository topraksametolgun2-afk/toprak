import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTicketSchema, insertTicketMessageSchema, insertReviewSchema, type User } from "@shared/schema";
import { z } from "zod";

// Session middleware mock - in real app this would use proper session management
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Mock authentication middleware
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In real implementation, this would check session/JWT
  // For now, we'll mock a user
  req.user = {
    id: "mock-user-id",
    email: "user@example.com",
    role: "BUYER",
    firstName: "Test",
    lastName: "User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: "",
    company: null,
    phone: null,
    address: null,
  };
  next();
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    const userId = req.url?.split('userId=')[1];
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // Helper function to send real-time notifications
  const sendRealTimeNotification = (userId: string, notification: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  };

  // Support ticket routes
  app.post("/api/support/tickets", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const ticket = await storage.createTicket(validatedData);

      // Create notification for admins
      const admins = await storage.getUsers();
      const adminUsers = admins.filter(user => user.role === "ADMIN");
      
      for (const admin of adminUsers) {
        const notification = await storage.createNotification({
          userId: admin.id,
          type: "TICKET_CREATED",
          title: "Yeni Destek Talebi",
          body: `${req.user!.firstName} ${req.user!.lastName} tarafından yeni bir destek talebi oluşturuldu: ${ticket.subject}`,
          ticketId: ticket.id,
        });
        
        sendRealTimeNotification(admin.id, notification);
      }

      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.get("/api/support/tickets", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      let tickets;
      if (req.user!.role === "ADMIN") {
        tickets = await storage.getAllTickets();
      } else {
        tickets = await storage.getTicketsByUser(req.user!.id);
      }

      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/support/tickets/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if user can access this ticket
      if (req.user!.role !== "ADMIN" && ticket.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await storage.getTicketMessages(ticket.id);
      
      res.json({ ticket, messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post("/api/support/tickets/:id/messages", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if user can access this ticket
      if (req.user!.role !== "ADMIN" && ticket.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedMessage = insertTicketMessageSchema.parse({
        ticketId: req.params.id,
        senderId: req.user!.id,
        message: req.body.message,
        isInternal: req.body.isInternal || false,
      });

      const message = await storage.createTicketMessage(validatedMessage);

      // Create notification for the other party
      const recipientId = req.user!.role === "ADMIN" ? ticket.userId : null;
      if (recipientId) {
        const notification = await storage.createNotification({
          userId: recipientId,
          type: "TICKET_UPDATED",
          title: "Destek Talebinize Yanıt",
          body: `Destek talebiniz (#${ticket.id.slice(-8)}) için yeni bir mesaj var.`,
          ticketId: ticket.id,
        });

        sendRealTimeNotification(recipientId, notification);
      }

      // Also notify admins if user sent the message
      if (req.user!.role !== "ADMIN") {
        const admins = await storage.getUsers();
        const adminUsers = admins.filter(user => user.role === "ADMIN");
        
        for (const admin of adminUsers) {
          const notification = await storage.createNotification({
            userId: admin.id,
            type: "TICKET_UPDATED",
            title: "Destek Talebinde Yeni Mesaj",
            body: `${ticket.subject} konulu talebe yeni mesaj eklendi.`,
            ticketId: ticket.id,
          });
          
          sendRealTimeNotification(admin.id, notification);
        }
      }

      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.put("/api/support/tickets/:id/status", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.body;
      
      if (!["OPEN", "CLOSED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const ticket = await storage.updateTicket(req.params.id, { status });
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Create notification for user
      const notification = await storage.createNotification({
        userId: ticket.userId,
        type: status === "CLOSED" ? "TICKET_CLOSED" : "TICKET_UPDATED",
        title: status === "CLOSED" ? "Destek Talebiniz Kapatıldı" : "Destek Talebiniz Güncellendi",
        body: `Destek talebinizin (#${ticket.id.slice(-8)}) durumu güncellendi: ${status === "CLOSED" ? "Kapatıldı" : "Açık"}`,
        ticketId: ticket.id,
      });

      sendRealTimeNotification(ticket.userId, notification);

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Order routes
  app.get("/api/orders", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Review routes
  app.get("/api/reviews/product/:productId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = req.params.productId;
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const reviews = await storage.getReviewsByProduct(productId, offset, limit);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/product/:productId/average", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = req.params.productId;
      const average = await storage.getProductRatingAverage(productId);
      res.json({ average });
    } catch (error) {
      console.error("Error fetching rating average:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if user already reviewed this product
      const existingReview = await storage.getUserReviewForProduct(req.user.id, reviewData.productId);
      if (existingReview) {
        return res.status(400).json({ message: "Bir ürüne sadece bir kez değerlendirme yapabilirsiniz" });
      }

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/user/:productId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const productId = req.params.productId;
      const review = await storage.getUserReviewForProduct(req.user.id, productId);
      res.json(review || null);
    } catch (error) {
      console.error("Error fetching user review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/reviews/:reviewId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const reviewId = req.params.reviewId;
      const existingReview = await storage.getReview(reviewId);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Değerlendirme bulunamadı" });
      }

      if (existingReview.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu değerlendirmeyi güncelleyemezsiniz" });
      }

      const updates = insertReviewSchema.partial().parse(req.body);
      const updatedReview = await storage.updateReview(reviewId, updates);
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/reviews/:reviewId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const reviewId = req.params.reviewId;
      const existingReview = await storage.getReview(reviewId);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Değerlendirme bulunamadı" });
      }

      if (existingReview.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu değerlendirmeyi silemezsiniz" });
      }

      const deleted = await storage.deleteReview(reviewId);
      
      if (deleted) {
        res.json({ message: "Değerlendirme silindi" });
      } else {
        res.status(404).json({ message: "Değerlendirme bulunamadı" });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
