import { Router } from "express";
import { db } from "../../shared/schema.js";
import { orders, products, users, insertOrderSchema } from "../../shared/schema.js";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";
import { notificationService } from "../services/notificationService.js";

const router = Router();

// Siparişleri getir (rol bazlı)
router.get("/", async (req, res) => {
  try {
    const { userId, role } = req.query;
    
    if (!userId || !role) {
      return res.status(400).json({ error: "userId ve role gerekli" });
    }
    
    let whereCondition;
    
    if (role === "BUYER") {
      whereCondition = eq(orders.buyerId, userId as string);
    } else if (role === "SELLER") {
      whereCondition = eq(orders.sellerId, userId as string);
    } else {
      // Admin tüm siparişleri görebilir
      whereCondition = undefined;
    }
    
    const orderList = await db
      .select({
        order: orders,
        product: products,
        buyer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company
        }
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.buyerId, users.id))
      .where(whereCondition);
    
    res.json({ orders: orderList });
  } catch (error) {
    console.error("Siparişler getirilirken hata:", error);
    res.status(500).json({ error: "Siparişler getirilemedi" });
  }
});

// Yeni sipariş oluştur
router.post("/", async (req, res) => {
  try {
    const validatedData = insertOrderSchema.parse(req.body);
    
    // Ürün bilgilerini getir
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
      .limit(1);
    
    if (!product) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }
    
    // Stok kontrolü
    if (product.stock < validatedData.quantity) {
      return res.status(400).json({ error: "Yetersiz stok" });
    }
    
    // Toplam fiyatı hesapla
    const totalPrice = (parseFloat(validatedData.unitPrice.toString()) * validatedData.quantity).toString();
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...validatedData,
        totalPrice,
        sellerId: product.sellerId
      })
      .returning();
    
    // Toptancıya bildirim gönder
    await notificationService.handleNewOrder(newOrder.id);
    
    res.status(201).json({ 
      message: "Sipariş oluşturuldu", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Geçersiz veri", details: error.errors });
    }
    
    res.status(500).json({ error: "Sipariş oluşturulamadı" });
  }
});

// Sipariş durumunu güncelle
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const updateStatusSchema = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "SHIPPED", "DELIVERED"]),
      sellerId: z.string(), // Sadece sipariş sahibi güncelleyebilir
      notes: z.string().optional()
    });
    
    const { status, sellerId, notes } = updateStatusSchema.parse(req.body);
    
    // Mevcut siparişi getir
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    
    if (!existingOrder) {
      return res.status(404).json({ error: "Sipariş bulunamadı" });
    }
    
    // Yetki kontrolü
    if (existingOrder.sellerId !== sellerId) {
      return res.status(403).json({ error: "Bu siparişi güncelleme yetkiniz yok" });
    }
    
    const oldStatus = existingOrder.status;
    
    // Siparişi güncelle
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status, 
        notes,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    
    // Durumu değişti ise bildirim gönder
    if (oldStatus !== status) {
      await notificationService.handleOrderStatusChange(id, status, oldStatus);
    }
    
    res.json({ 
      message: "Sipariş durumu güncellendi", 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Sipariş durumu güncelleme hatası:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Geçersiz veri", details: error.errors });
    }
    
    res.status(500).json({ error: "Sipariş güncellenemedi" });
  }
});

// Sipariş detaylarını getir
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orderDetail] = await db
      .select({
        order: orders,
        product: products,
        buyer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          company: users.company,
          phone: users.phone
        }
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.buyerId, users.id))
      .where(eq(orders.id, id))
      .limit(1);
    
    if (!orderDetail) {
      return res.status(404).json({ error: "Sipariş bulunamadı" });
    }
    
    res.json({ order: orderDetail });
  } catch (error) {
    console.error("Sipariş detayı getirme hatası:", error);
    res.status(500).json({ error: "Sipariş detayı getirilemedi" });
  }
});

export { router as orderRoutes };