import { Router } from "express";
import { mockDataService } from "../services/mockDataService.js";
import { z } from "zod";

const router = Router();

// Demo giriş sistemi
router.post("/login", async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });
    
    const { email, password } = loginSchema.parse(req.body);
    
    const user = mockDataService.authenticate(email, password);
    
    if (!user) {
      return res.status(401).json({ error: "Geçersiz email veya şifre" });
    }
    
    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      message: "Giriş başarılı", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Giriş hatası:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Geçersiz veri", details: error.errors });
    }
    
    res.status(500).json({ error: "Giriş yapılamadı" });
  }
});

// Demo için kayıt devre dışı
router.post("/register", async (req, res) => {
  res.status(501).json({ 
    error: "Kayıt özelliği demo'da devre dışı", 
    message: "Lütfen demo hesapları kullanın" 
  });
});

// Kullanıcı profili getir
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = mockDataService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Profil getirme hatası:", error);
    res.status(500).json({ error: "Profil getirilemedi" });
  }
});

export { router as authRoutes };