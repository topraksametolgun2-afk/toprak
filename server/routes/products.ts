import { Router } from "express";
import { db } from "../../shared/schema.js";
import { products, users, insertProductSchema } from "../../shared/schema.js";
import { eq, and, ilike } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Ürünleri getir (filtreleme ile)
router.get("/", async (req, res) => {
  try {
    const { category, search, sellerId, limit } = req.query;
    
    let whereCondition = and(eq(products.isActive, true));
    
    if (category) {
      whereCondition = and(whereCondition, eq(products.category, category as string));
    }
    
    if (search) {
      whereCondition = and(whereCondition, ilike(products.name, `%${search}%`));
    }
    
    if (sellerId) {
      whereCondition = and(whereCondition, eq(products.sellerId, sellerId as string));
    }
    
    const productList = await db
      .select({
        product: products,
        seller: {
          id: users.id,
          company: users.company,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(whereCondition)
      .limit(parseInt(limit as string) || 50);
    
    res.json({ products: productList });
  } catch (error) {
    console.error("Ürünler getirilirken hata:", error);
    res.status(500).json({ error: "Ürünler getirilemedi" });
  }
});

// Yeni ürün oluştur
router.post("/", async (req, res) => {
  try {
    const validatedData = insertProductSchema.parse(req.body);
    
    const [newProduct] = await db
      .insert(products)
      .values(validatedData)
      .returning();
    
    res.status(201).json({ 
      message: "Ürün oluşturuldu", 
      product: newProduct 
    });
  } catch (error) {
    console.error("Ürün oluşturma hatası:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Geçersiz veri", details: error.errors });
    }
    
    res.status(500).json({ error: "Ürün oluşturulamadı" });
  }
});

// Ürün detaylarını getir
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [productDetail] = await db
      .select({
        product: products,
        seller: {
          id: users.id,
          company: users.company,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.id, id))
      .limit(1);
    
    if (!productDetail) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }
    
    res.json({ product: productDetail });
  } catch (error) {
    console.error("Ürün detayı getirme hatası:", error);
    res.status(500).json({ error: "Ürün detayı getirilemedi" });
  }
});

// Ürün güncelle
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Sadece ürün sahibi güncelleyebilir
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    if (!existingProduct) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }
    
    if (existingProduct.sellerId !== updateData.sellerId) {
      return res.status(403).json({ error: "Bu ürünü güncelleme yetkiniz yok" });
    }
    
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    
    res.json({ 
      message: "Ürün güncellendi", 
      product: updatedProduct 
    });
  } catch (error) {
    console.error("Ürün güncelleme hatası:", error);
    res.status(500).json({ error: "Ürün güncellenemedi" });
  }
});

// Ürün sil (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerId } = req.body;
    
    // Yetki kontrolü
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    if (!existingProduct) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }
    
    if (existingProduct.sellerId !== sellerId) {
      return res.status(403).json({ error: "Bu ürünü silme yetkiniz yok" });
    }
    
    await db
      .update(products)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(products.id, id));
    
    res.json({ message: "Ürün silindi" });
  } catch (error) {
    console.error("Ürün silme hatası:", error);
    res.status(500).json({ error: "Ürün silinemedi" });
  }
});

export { router as productRoutes };