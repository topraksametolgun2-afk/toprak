import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTicketSchema, insertTicketReplySchema, insertUserSchema, updateProfileSchema, updatePasswordSchema, updateNotificationSchema, insertReviewSchema, updateReviewSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, ws);

    ws.on('close', () => {
      clients.delete(clientId);
    });
  });

  function broadcastNotification(message: any) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Mock authentication middleware
  app.use('/api', (req, res, next) => {
    // Simple mock authentication - in real app, use proper session/JWT
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const username = authHeader.replace('Bearer ', '');
      storage.getUserByUsername(username).then(user => {
        if (user) {
          (req as any).user = user;
        }
      });
    }
    next();
  });

  // Support ticket routes
  app.post('/api/support/tickets', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket({
        ...validatedData,
        userId: user.id
      });

      // Notify admins of new ticket
      broadcastNotification({
        type: 'new_ticket',
        ticket,
        user: { username: user.username, email: user.email }
      });

      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: 'Invalid ticket data', error });
    }
  });

  app.get('/api/support/tickets', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const tickets = await storage.getTicketsByUserId(user.id);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tickets', error });
    }
  });

  app.get('/api/support/tickets/:id', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user owns ticket or is admin
      if (ticket.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const replies = await storage.getRepliesByTicketId(ticket.id);
      res.json({ ticket, replies });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ticket', error });
    }
  });

  // Admin routes
  app.get('/api/support/admin/tickets', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tickets', error });
    }
  });

  app.put('/api/support/admin/tickets/:id/status', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { status } = req.body;
      if (!['açık', 'yanıtlandı', 'kapalı', 'beklemede'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const ticket = await storage.updateTicketStatus(req.params.id, status);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Notify user of status change
      broadcastNotification({
        type: 'status_update',
        ticketId: ticket.id,
        status,
        userId: ticket.userId
      });

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update ticket status', error });
    }
  });

  app.post('/api/support/admin/tickets/:id/reply', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const validatedData = insertTicketReplySchema.parse({
        ...req.body,
        ticketId: req.params.id,
        userId: user.id,
        isAdminReply: "true"
      });

      const reply = await storage.createTicketReply(validatedData);

      // Update ticket status to replied
      await storage.updateTicketStatus(req.params.id, 'yanıtlandı');

      // Notify user of new reply
      broadcastNotification({
        type: 'new_reply',
        ticketId: ticket.id,
        reply,
        userId: ticket.userId
      });

      res.status(201).json(reply);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create reply', error });
    }
  });

  // User reply route
  app.post('/api/support/tickets/:id/reply', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      if (ticket.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const validatedData = insertTicketReplySchema.parse({
        ...req.body,
        ticketId: req.params.id,
        userId: user.id,
        isAdminReply: "false"
      });

      const reply = await storage.createTicketReply(validatedData);

      // Update ticket status to open if it was closed
      if (ticket.status === 'kapalı') {
        await storage.updateTicketStatus(req.params.id, 'açık');
      }

      res.status(201).json(reply);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create reply', error });
    }
  });

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        },
        token: username // Simple token for demo
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser(validatedData);
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed', error });
    }
  });

  // Profile routes
  app.get('/api/profile', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const fullUser = await storage.getUser(user.id);
      if (!fullUser) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const { password, ...userWithoutPassword } = fullUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Profil bilgileri alınamadı', error });
    }
  });

  app.put('/api/profile', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(user.id, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: 'Profil güncellenemedi', error });
    }
  });

  app.put('/api/profile/password', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = updatePasswordSchema.parse(req.body);
      const currentUser = await storage.getUser(user.id);
      
      if (!currentUser) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      if (currentUser.password !== validatedData.currentPassword) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }

      const success = await storage.updateUserPassword(user.id, validatedData.newPassword);
      
      if (!success) {
        return res.status(500).json({ message: 'Şifre güncellenemedi' });
      }

      res.json({ message: 'Şifre başarıyla güncellendi' });
    } catch (error) {
      res.status(400).json({ message: 'Şifre güncellenemedi', error });
    }
  });

  app.put('/api/profile/notifications', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = updateNotificationSchema.parse(req.body);
      const updatedUser = await storage.updateUserNotifications(user.id, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: 'Bildirim ayarları güncellenemedi', error });
    }
  });

  // Profil fotoğrafı yükleme endpoint'i
  app.post('/api/profile/avatar', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { imageData, fileName } = req.body;
      
      if (!imageData || !fileName) {
        return res.status(400).json({ message: 'Resim verisi eksik' });
      }

      // Base64 verisini çözümle
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Dosya yükleme dizinini oluştur
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Dosya adını oluştur
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${user.id}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      
      // Dosyayı kaydet
      writeFileSync(filePath, buffer);
      
      // Kullanıcı profilini güncelle
      const profileImageUrl = `/uploads/avatars/${uniqueFileName}`;
      const updatedUser = await storage.updateUserProfileImage(user.id, profileImageUrl);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: 'Profil fotoğrafı yüklenemedi', error });
    }
  });

  // Statik dosya sunumu
  app.use('/uploads', (req, res, next) => {
    // Basit CORS ve cache header'ları
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cache-Control', 'public, max-age=86400'); // 1 gün cache
    next();
  });

  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      
      // Her ürün için ortalama puanı ekle
      const productsWithRatings = await Promise.all(
        products.map(async (product) => {
          const rating = await storage.getAverageRating(product.id);
          return {
            ...product,
            averageRating: rating.average,
            reviewCount: rating.count
          };
        })
      );
      
      res.json(productsWithRatings);
    } catch (error) {
      res.status(500).json({ message: 'Ürünler getirilemedi', error });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı' });
      }

      const rating = await storage.getAverageRating(product.id);
      const reviews = await storage.getReviewsByProductId(product.id);
      
      // Yorumların kullanıcı bilgilerini ekle
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            user: {
              id: user?.id,
              username: user?.username,
              firstName: user?.firstName,
              lastName: user?.lastName
            }
          };
        })
      );
      
      res.json({
        ...product,
        averageRating: rating.average,
        reviewCount: rating.count,
        reviews: reviewsWithUsers
      });
    } catch (error) {
      res.status(500).json({ message: 'Ürün detayları getirilemedi', error });
    }
  });

  // Reviews routes
  app.post('/api/products/:productId/reviews', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId } = req.params;
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı' });
      }

      // Kullanıcının bu ürün için zaten yorumu var mı kontrol et
      const existingReviews = await storage.getReviewsByProductId(productId);
      const userHasReview = existingReviews.some(review => review.userId === user.id);
      
      if (userHasReview) {
        return res.status(400).json({ message: 'Bu ürün için zaten bir değerlendirmeniz var' });
      }

      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...validatedData,
        productId,
        userId: user.id
      });

      // Kullanıcı bilgilerini ekle
      const reviewWithUser = {
        ...review,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };

      res.status(201).json(reviewWithUser);
    } catch (error) {
      res.status(400).json({ message: 'Değerlendirme eklenemedi', error });
    }
  });

  app.put('/api/reviews/:id', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const review = await storage.getReviewById(req.params.id);
      
      if (!review) {
        return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
      }

      // Sadece kendi yorumunu düzenleyebilir
      if (review.userId !== user.id) {
        return res.status(403).json({ message: 'Bu değerlendirmeyi düzenleme yetkiniz yok' });
      }

      const validatedData = updateReviewSchema.parse(req.body);
      const updatedReview = await storage.updateReview(req.params.id, validatedData);
      
      if (!updatedReview) {
        return res.status(500).json({ message: 'Değerlendirme güncellenemedi' });
      }

      // Kullanıcı bilgilerini ekle
      const reviewWithUser = {
        ...updatedReview,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };

      res.json(reviewWithUser);
    } catch (error) {
      res.status(400).json({ message: 'Değerlendirme güncellenemedi', error });
    }
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const review = await storage.getReviewById(req.params.id);
      
      if (!review) {
        return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
      }

      // Sadece kendi yorumunu silebilir
      if (review.userId !== user.id) {
        return res.status(403).json({ message: 'Bu değerlendirmeyi silme yetkiniz yok' });
      }

      const success = await storage.deleteReview(req.params.id);
      
      if (!success) {
        return res.status(500).json({ message: 'Değerlendirme silinemedi' });
      }

      res.json({ message: 'Değerlendirme başarıyla silindi' });
    } catch (error) {
      res.status(500).json({ message: 'Değerlendirme silinemedi', error });
    }
  });

  app.get('/api/my-reviews', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const reviews = await storage.getReviewsByUserId(user.id);
      
      // Her yorum için ürün bilgilerini ekle
      const reviewsWithProducts = await Promise.all(
        reviews.map(async (review) => {
          const product = await storage.getProductById(review.productId);
          return {
            ...review,
            product: {
              id: product?.id,
              name: product?.name,
              imageUrl: product?.imageUrl
            }
          };
        })
      );
      
      res.json(reviewsWithProducts);
    } catch (error) {
      res.status(500).json({ message: 'Değerlendirmeleriniz getirilemedi', error });
    }
  });

  return httpServer;
}
