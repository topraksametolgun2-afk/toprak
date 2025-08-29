import { Router } from "express";
import { mockDataService } from "../services/mockDataService.js";
import { z } from "zod";

const router = Router();

// Kullanıcının bildirimlerini getir
router.get("/", async (req, res) => {
  try {
    const { userId, limit } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId gerekli" });
    }
    
    const notifications = mockDataService.getUserNotifications(
      userId as string, 
      parseInt(limit as string) || 20
    );
    
    res.json({ notifications });
  } catch (error) {
    console.error("Bildirimler getirilirken hata:", error);
    res.status(500).json({ error: "Bildirimler getirilemedi" });
  }
});

// Okunmamış bildirim sayısını getir
router.get("/unread-count", async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId gerekli" });
    }
    
    const count = mockDataService.getUnreadCount(userId as string);
    
    res.json({ count });
  } catch (error) {
    console.error("Okunmamış bildirim sayısı getirilemedi:", error);
    res.status(500).json({ error: "Sayı getirilemedi" });
  }
});

// Bildirimi okundu olarak işaretle
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId gerekli" });
    }
    
    const success = mockDataService.markAsRead(id, userId);
    
    if (success) {
      res.json({ message: "Bildirim okundu olarak işaretlendi" });
    } else {
      res.status(404).json({ error: "Bildirim bulunamadı" });
    }
  } catch (error) {
    console.error("Bildirim okundu işaretlenirken hata:", error);
    res.status(500).json({ error: "Bildirim güncellenemedi" });
  }
});

// Tüm bildirimleri okundu olarak işaretle
router.put("/mark-all-read", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId gerekli" });
    }
    
    mockDataService.markAllAsRead(userId);
    
    res.json({ message: "Tüm bildirimler okundu olarak işaretlendi" });
  } catch (error) {
    console.error("Tüm bildirimler okundu işaretlenirken hata:", error);
    res.status(500).json({ error: "Bildirimler güncellenemedi" });
  }
});

// Test bildirimi oluştur
router.post("/test", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId gerekli" });
    }
    
    const notification = mockDataService.createTestNotification(userId);
    
    res.status(201).json({ 
      message: "Test bildirimi oluşturuldu", 
      notification 
    });
  } catch (error) {
    console.error("Test bildirimi oluşturulurken hata:", error);
    res.status(500).json({ error: "Test bildirimi oluşturulamadı" });
  }
});

// Demo için sipariş simülasyonu
router.post("/demo/simulate-order", async (req, res) => {
  try {
    const { buyerId, sellerId, action } = req.body;
    
    if (!buyerId || !sellerId || !action) {
      return res.status(400).json({ error: "buyerId, sellerId ve action gerekli" });
    }
    
    let notification;
    
    switch (action) {
      case 'ORDER_PLACED':
        // Toptancıya sipariş bildirimi
        notification = mockDataService.createNotification({
          userId: sellerId,
          type: 'ORDER_PLACED',
          title: 'Yeni Sipariş!',
          message: 'Demo ürününden 15 adet sipariş aldınız.'
        });
        break;
        
      case 'ORDER_APPROVED':
        // Alıcıya onay bildirimi
        notification = mockDataService.createNotification({
          userId: buyerId,
          type: 'ORDER_APPROVED',
          title: 'Sipariş Onaylandı!',
          message: 'Demo siparişiniz onaylandı ve hazırlanıyor.'
        });
        break;
        
      case 'ORDER_SHIPPED':
        // Alıcıya kargo bildirimi
        notification = mockDataService.createNotification({
          userId: buyerId,
          type: 'ORDER_SHIPPED',
          title: 'Sipariş Kargoya Verildi!',
          message: 'Demo siparişiniz kargoya verildi.'
        });
        break;
        
      default:
        return res.status(400).json({ error: "Geçersiz action" });
    }
    
    res.json({ 
      message: "Demo bildirim oluşturuldu", 
      notification 
    });
  } catch (error) {
    console.error("Demo bildirim hatası:", error);
    res.status(500).json({ error: "Demo bildirim oluşturulamadı" });
  }
});

export { router as notificationRoutes };