import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTicketSchema, insertMessageSchema, updateTicketSchema, insertProductSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    let clientId: string;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth') {
          clientId = data.userId;
          clients.set(clientId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (clientId) {
        clients.delete(clientId);
      }
    });
  });

  // Broadcast to all connected clients
  function broadcast(message: any) {
    clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Authentication middleware (simplified)
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'] || 'user-1'; // Simplified auth
    req.userId = userId;
    next();
  };

  // Get current user
  app.get('/api/me', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create ticket
  app.post('/api/tickets', requireAuth, async (req: any, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const ticket = await storage.createTicket(ticketData);
      
      // Broadcast new ticket to admin clients
      broadcast({
        type: 'new_ticket',
        ticket
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get tickets
  app.get('/api/tickets', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      const isAdmin = user?.isAdmin === 'true';
      const tickets = await storage.getTickets(isAdmin ? undefined : req.userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get ticket by id
  app.get('/api/tickets/:id', requireAuth, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      const isAdmin = user?.isAdmin === 'true';
      
      if (!isAdmin && ticket.userId !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update ticket status
  app.patch('/api/tickets/:id/status', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      const isAdmin = user?.isAdmin === 'true';
      
      if (!isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = updateTicketSchema.parse({
        status: req.body.status,
        updatedAt: new Date()
      });
      
      const ticket = await storage.updateTicketStatus(req.params.id, updateData);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Broadcast status update
      broadcast({
        type: 'ticket_status_updated',
        ticket
      });
      
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get messages for a ticket
  app.get('/api/tickets/:id/messages', requireAuth, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      const isAdmin = user?.isAdmin === 'true';
      
      if (!isAdmin && ticket.userId !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const messages = await storage.getMessagesByTicketId(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Send message
  app.post('/api/tickets/:id/messages', requireAuth, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      const isAdmin = user?.isAdmin === 'true';
      
      if (!isAdmin && ticket.userId !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const messageData = insertMessageSchema.parse({
        ticketId: req.params.id,
        userId: req.userId,
        content: req.body.content,
        isAdmin: isAdmin ? 'true' : 'false'
      });
      
      const message = await storage.createMessage(messageData);
      
      // Update ticket status to 'answered' if admin replied
      if (isAdmin && ticket.status === 'open') {
        await storage.updateTicketStatus(req.params.id, { 
          status: 'answered', 
          updatedAt: new Date() 
        });
      }
      
      // Broadcast new message
      broadcast({
        type: 'new_message',
        message,
        ticketId: req.params.id
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get ticket statistics (admin only)
  app.get('/api/admin/stats', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByUsername(req.userId === 'admin-1' ? 'admin' : 'user');
      const isAdmin = user?.isAdmin === 'true';
      
      if (!isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const stats = await storage.getTicketStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/search", async (req, res) => {
    const { q, category, minPrice, maxPrice, minRating } = req.query;
    
    const products = await storage.searchProducts(
      q as string,
      category as string,
      minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice ? parseFloat(maxPrice as string) : undefined,
      minRating ? parseFloat(minRating as string) : undefined
    );
    
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  return httpServer;
}
