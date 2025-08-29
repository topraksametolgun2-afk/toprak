import { Router } from "express";
import { mockDataService } from "../services/mockDataService.js";
import { z } from "zod";

const router = Router();

// Chat odalarını listele (kullanıcının dahil olduğu)
router.get("/chat-rooms/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const chatRooms = mockDataService.getChatRoomsByUser(userId);
    
    res.json({ chatRooms });
  } catch (error) {
    console.error("Chat odaları getirme hatası:", error);
    res.status(500).json({ error: "Chat odaları getirilemedi" });
  }
});

// Belirli bir chat odasının mesajlarını getir
router.get("/chat-room/:chatRoomId", async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = mockDataService.getMessagesByChatRoom(
      chatRoomId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({ messages });
  } catch (error) {
    console.error("Mesajlar getirme hatası:", error);
    res.status(500).json({ error: "Mesajlar getirilemedi" });
  }
});

// Sipariş için chat odası oluştur veya getir
router.post("/chat-room/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { buyerId, sellerId } = req.body;
    
    if (!buyerId || !sellerId) {
      return res.status(400).json({ error: "buyerId ve sellerId gerekli" });
    }
    
    let chatRoom = mockDataService.getChatRoomByOrder(orderId);
    
    if (!chatRoom) {
      chatRoom = mockDataService.createChatRoom({
        orderId,
        buyerId,
        sellerId
      });
    }
    
    res.json({ chatRoom });
  } catch (error) {
    console.error("Chat odası oluşturma hatası:", error);
    res.status(500).json({ error: "Chat odası oluşturulamadı" });
  }
});

// Yeni mesaj gönder
router.post("/send", async (req, res) => {
  try {
    const messageSchema = z.object({
      chatRoomId: z.string(),
      senderId: z.string(),
      receiverId: z.string(),
      content: z.string().min(1),
      type: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]).optional().default("TEXT")
    });
    
    const validatedData = messageSchema.parse(req.body);
    
    const message = mockDataService.createMessage(validatedData);
    
    res.status(201).json({ 
      message: "Mesaj gönderildi",
      data: message 
    });
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Geçersiz veri", details: error.errors });
    }
    
    res.status(500).json({ error: "Mesaj gönderilemedi" });
  }
});

// Mesajları okundu olarak işaretle
router.patch("/mark-read", async (req, res) => {
  try {
    const { messageIds, userId } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds) || !userId) {
      return res.status(400).json({ error: "messageIds array ve userId gerekli" });
    }
    
    const updatedCount = mockDataService.markMessagesAsRead(messageIds, userId);
    
    res.json({ 
      message: "Mesajlar okundu olarak işaretlendi",
      updatedCount 
    });
  } catch (error) {
    console.error("Mesaj güncelleme hatası:", error);
    res.status(500).json({ error: "Mesajlar güncellenemedi" });
  }
});

// Chat odasındaki okunmamış mesaj sayısı
router.get("/unread-count/:chatRoomId/:userId", async (req, res) => {
  try {
    const { chatRoomId, userId } = req.params;
    
    const count = mockDataService.getUnreadMessageCount(chatRoomId, userId);
    
    res.json({ count });
  } catch (error) {
    console.error("Okunmamış mesaj sayısı getirme hatası:", error);
    res.status(500).json({ error: "Okunmamış mesaj sayısı getirilemedi" });
  }
});

// Kullanıcının tüm okunmamış mesaj sayısı
router.get("/unread-total/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = mockDataService.getTotalUnreadMessageCount(userId);
    
    res.json({ count });
  } catch (error) {
    console.error("Toplam okunmamış mesaj sayısı getirme hatası:", error);
    res.status(500).json({ error: "Toplam okunmamış mesaj sayısı getirilemedi" });
  }
});

export { router as messageRoutes };