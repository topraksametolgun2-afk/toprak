import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertInventorySchema, updateStockSchema, updateShippingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Inventory Stats
  app.get("/api/inventory/stats", async (req, res) => {
    try {
      const stats = await storage.getInventoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get all products with inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get single product with inventory
  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Update stock
  app.patch("/api/inventory/update", async (req, res) => {
    try {
      const validatedData = updateStockSchema.parse(req.body);
      const updatedInventory = await storage.updateStock(validatedData);
      res.json(updatedInventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  });

  // Get critical stock products
  app.get("/api/inventory/critical", async (req, res) => {
    try {
      const products = await storage.getCriticalStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get stock movements
  app.get("/api/inventory/movements", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const movements = await storage.getStockMovements(limit);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Create new product
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body.product);
      const inventoryData = insertInventorySchema.parse(req.body.inventory);
      
      const newProduct = await storage.createProduct(productData, inventoryData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  });

  // Update product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, productData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Process order (reduce inventory)
  app.post("/api/orders/process", async (req, res) => {
    try {
      const { orderId, items } = req.body;
      await storage.processOrderInventory(orderId, items);
      res.json({ message: "Order processed successfully" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Order processing failed" });
    }
  });

  // Shipping and Order endpoints
  
  // Get all orders with shipping
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get single order with shipping
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get user orders
  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get all shippings
  app.get("/api/shipping", async (req, res) => {
    try {
      const shippings = await storage.getShippings();
      res.json(shippings);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get shipping stats
  app.get("/api/shipping/stats", async (req, res) => {
    try {
      const stats = await storage.getShippingStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get single shipping by order ID
  app.get("/api/shipping/:orderId", async (req, res) => {
    try {
      const shipping = await storage.getShipping(req.params.orderId);
      if (!shipping) {
        return res.status(404).json({ message: "Shipping not found" });
      }
      res.json(shipping);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Update shipping status
  app.patch("/api/shipping/update", async (req, res) => {
    try {
      const validatedData = updateShippingSchema.parse(req.body);
      const updatedShipping = await storage.updateShipping(validatedData);
      res.json(updatedShipping);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
