import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { 
  insertUserSchema, 
  loginSchema, 
  updateProfileSchema, 
  updatePasswordSchema, 
  updatePreferencesSchema 
} from "@shared/schema";
import { authService } from "./services/auth";
import { authGuard, type AuthRequest } from "./middleware/auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const { user, token } = await authService.register(userData);
      
      // Don't send password hash to client
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Kayıt işlemi başarısız" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const { user, token } = await authService.login(loginData);
      
      // Don't send password hash to client
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(401).json({ message: error instanceof Error ? error.message : "Giriş başarısız" });
    }
  });

  app.get("/api/auth/me", authGuard, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Kimlik doğrulama gereklidir" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      // Don't send password hash to client
      const { password_hash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // Profile routes
  app.put("/api/profile", authGuard, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Kimlik doğrulama gereklidir" });
      }

      const profileData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateProfile(req.user.id, profileData);
      
      // Don't send password hash to client
      const { password_hash, ...userWithoutPassword } = updatedUser;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Profil güncellenemedi" });
    }
  });

  app.put("/api/profile/password", authGuard, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Kimlik doğrulama gereklidir" });
      }

      const passwordData = updatePasswordSchema.parse(req.body);
      
      // Verify current password
      const isValidPassword = await authService.verifyPassword(
        req.user.id, 
        passwordData.current_password
      );
      
      if (!isValidPassword) {
        return res.status(400).json({ message: "Mevcut şifre hatalı" });
      }

      // Update password
      await authService.updatePassword(req.user.id, passwordData.new_password);
      
      res.json({ message: "Şifre başarıyla güncellendi" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Şifre güncellenemedi" });
    }
  });

  app.put("/api/profile/preferences", authGuard, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Kimlik doğrulama gereklidir" });
      }

      const preferencesData = updatePreferencesSchema.parse(req.body);
      const updatedUser = await storage.updatePreferences(req.user.id, preferencesData);
      
      // Don't send password hash to client
      const { password_hash, ...userWithoutPassword } = updatedUser;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Tercihler güncellenemedi" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
