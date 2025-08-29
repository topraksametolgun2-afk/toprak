import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import type { ProductSearchParams } from "@shared/schema";

const productSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating_desc', 'name_asc', 'stock_desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get products with search, filter and pagination
  app.get("/api/products", async (req, res) => {
    try {
      const searchParams = productSearchSchema.parse(req.query);
      const result = await storage.getProducts(searchParams);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid search parameters",
          details: error.errors 
        });
      } else {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Get single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Get seller info
      const seller = await storage.getSeller(product.sellerId);
      
      res.json({
        ...product,
        seller: seller || { id: product.sellerId, firstName: 'Unknown', lastName: 'Seller', company: null }
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get available categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User profile endpoints
  app.get("/api/profile", async (req, res) => {
    try {
      // Mock user profile data - in real app this would be based on session/auth
      res.json({
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "05551234567",
        company: "ABC Şirketi"
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      // Mock profile update - in real app this would update the database
      console.log("Profile update:", req.body);
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Product reviews endpoints
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Mock reviews data
      const reviews = [
        {
          id: "review-1",
          userId: "user-1",
          userName: "Mehmet K.",
          rating: 5,
          comment: "Harika bir telefon, kamerasını çok beğendim. Hızlı kargo ve güvenli paketleme.",
          createdAt: "2025-08-25T10:00:00Z"
        },
        {
          id: "review-2",
          userId: "user-2",
          userName: "Ayşe T.",
          rating: 4,
          comment: "Kaliteli ürün ama fiyatı biraz yüksek. Genel olarak memnunum.",
          createdAt: "2025-08-20T15:30:00Z"
        }
      ];

      const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      res.json({
        reviews,
        average: average.toFixed(1),
        total: reviews.length
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const { productId, rating, comment } = req.body;
      
      // Mock review creation
      const newReview = {
        id: `review-${Date.now()}`,
        productId,
        userId: "user-1",
        userName: "Current User",
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString()
      };

      console.log("New review created:", newReview);
      res.json({ success: true, review: newReview });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Support tickets endpoints
  app.get("/api/support/tickets", async (req, res) => {
    try {
      // Mock support tickets
      const tickets = [
        {
          id: "ticket-1",
          userId: "user-1",
          subject: "Sipariş teslimat problemi",
          category: "shipping",
          priority: "high",
          status: "open",
          description: "Siparişim 5 gündür kargoda bekliyor, takip numarası çalışmıyor.",
          createdAt: "2025-08-29T10:00:00Z",
          updatedAt: "2025-08-29T10:00:00Z"
        },
        {
          id: "ticket-2",
          userId: "user-1",
          subject: "Ürün iade talebi",
          category: "returns",
          priority: "medium",
          status: "in_progress",
          description: "Aldığım telefon kutusundan hasarlı çıktı, iade etmek istiyorum.",
          createdAt: "2025-08-28T15:30:00Z",
          updatedAt: "2025-08-29T09:15:00Z"
        }
      ];

      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/support/tickets", async (req, res) => {
    try {
      const { subject, category, priority, description } = req.body;
      
      const newTicket = {
        id: `ticket-${Date.now()}`,
        userId: "user-1",
        subject,
        category,
        priority,
        status: "open",
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("New support ticket created:", newTicket);
      res.json({ success: true, ticket: newTicket });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inventory management endpoints
  app.get("/api/inventory", async (req, res) => {
    try {
      // Mock inventory data
      const inventory = [
        {
          id: "inv-1",
          productId: "prod-1",
          productName: "Samsung Galaxy S24 Ultra",
          category: "Elektronik",
          currentStock: 15,
          reservedStock: 3,
          availableStock: 12,
          minStockLevel: 10,
          maxStockLevel: 50,
          unitCost: 20000,
          totalValue: 300000,
          lastUpdated: new Date().toISOString(),
          status: "normal"
        },
        {
          id: "inv-2",
          productId: "prod-2",
          productName: "MacBook Pro M3",
          category: "Bilgisayar",
          currentStock: 5,
          reservedStock: 2,
          availableStock: 3,
          minStockLevel: 8,
          maxStockLevel: 25,
          unitCost: 40000,
          totalValue: 200000,
          lastUpdated: new Date().toISOString(),
          status: "low"
        }
      ];

      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory/update", async (req, res) => {
    try {
      const { productId, quantity, reason } = req.body;
      
      console.log("Inventory update:", { productId, quantity, reason });
      res.json({ success: true, message: "Inventory updated successfully" });
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Mock admin users data
      const users = [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          role: "BUYER",
          company: "ABC Ltd",
          isActive: true,
          createdAt: "2025-08-20T10:00:00Z"
        },
        {
          id: "user-2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "SELLER",
          company: "XYZ Corp",
          isActive: true,
          createdAt: "2025-08-18T15:30:00Z"
        }
      ];

      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      // Mock admin statistics
      const stats = {
        totalUsers: 150,
        totalProducts: 25,
        totalOrders: 300,
        lowStockItems: 5,
        pendingTickets: 3,
        totalRevenue: 1250000
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
