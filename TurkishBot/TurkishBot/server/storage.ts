import { users, type User, type InsertUser, type UpdateProfile, type UpdatePreferences } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: Omit<InsertUser, 'password'> & { password_hash: string }): Promise<User>;
  updateProfile(id: string, data: UpdateProfile): Promise<User>;
  updatePassword(id: string, password_hash: string): Promise<void>;
  updatePreferences(id: string, data: UpdatePreferences): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: Omit<InsertUser, 'password'> & { password_hash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password_hash: userData.password_hash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        company: userData.company,
        role: userData.role,
      })
      .returning();
    return user;
  }

  async updateProfile(id: string, data: UpdateProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updatePassword(id: string, password_hash: string): Promise<void> {
    await db
      .update(users)
      .set({ password_hash })
      .where(eq(users.id, id));
  }

  async updatePreferences(id: string, data: UpdatePreferences): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
