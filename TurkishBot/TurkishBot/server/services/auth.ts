import bcrypt from "bcryptjs";
import { User, InsertUser, LoginData } from "@shared/schema";
import { storage } from "../storage";
import { generateToken } from "../middleware/auth";

export class AuthService {
  async register(userData: InsertUser): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Bu e-posta adresi ile zaten bir hesap bulunmaktadır");
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const { password, ...userDataWithoutPassword } = userData;
    const user = await storage.createUser({
      ...userDataWithoutPassword,
      password_hash,
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    return { user, token };
  }

  async login(loginData: LoginData): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await storage.getUserByEmail(loginData.email);
    if (!user) {
      throw new Error("E-posta veya şifre hatalı");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("E-posta veya şifre hatalı");
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    return { user, token };
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    return bcrypt.compare(password, user.password_hash);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    await storage.updatePassword(userId, password_hash);
  }
}

export const authService = new AuthService();
