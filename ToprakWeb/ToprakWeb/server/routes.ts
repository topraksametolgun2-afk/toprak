import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertStockItemSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Tickets
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.put("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Stock Items
  app.get("/api/stock", async (req, res) => {
    try {
      const stockItems = await storage.getStockItems();
      res.json(stockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock items" });
    }
  });

  app.get("/api/stock/:id", async (req, res) => {
    try {
      const stockItem = await storage.getStockItem(req.params.id);
      if (!stockItem) {
        return res.status(404).json({ message: "Stock item not found" });
      }
      res.json(stockItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock item" });
    }
  });

  app.post("/api/stock", async (req, res) => {
    try {
      const validatedData = insertStockItemSchema.parse(req.body);
      const stockItem = await storage.createStockItem(validatedData);
      res.status(201).json(stockItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid stock item data" });
    }
  });

  app.put("/api/stock/:id", async (req, res) => {
    try {
      const stockItem = await storage.updateStockItem(req.params.id, req.body);
      if (!stockItem) {
        return res.status(404).json({ message: "Stock item not found" });
      }
      res.json(stockItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update stock item" });
    }
  });

  app.delete("/api/stock/:id", async (req, res) => {
    try {
      const success = await storage.deleteStockItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Stock item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stock item" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      // Note: In a real app, you wouldn't return all users with passwords
      res.json({ message: "Users endpoint - implement as needed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
