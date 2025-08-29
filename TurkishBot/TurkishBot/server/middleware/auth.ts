import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export interface AuthRequest extends Request {
  user?: User;
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Yetkilendirme token'ı gereklidir" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // Store the decoded info for use in routes
    req.user = { 
      id: decoded.userId, 
      role: decoded.role 
    } as User;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz token" });
  }
}

export function roleGuard(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Kimlik doğrulama gereklidir" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz bulunmamaktadır" });
    }

    next();
  };
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}
