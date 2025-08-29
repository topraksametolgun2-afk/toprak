import { 
  type User, type InsertUser, type Session, type Order, type InsertOrder,
  type Message, type InsertMessage, type Notification, type InsertNotification,
  users, sessions, orders, messages, notifications 
} from "@shared/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsers(limit?: number): Promise<User[]>;
  
  // Session operations
  createSession(userId: string): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
  deleteUserSessions(userId: string): Promise<boolean>;
  
  // Auth operations
  validatePassword(email: string, password: string): Promise<User | null>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByOrder(orderId: string): Promise<Message[]>;
  updateMessageStatus(messageId: string, status: string): Promise<Message | undefined>;
  getUnreadMessageCount(userId: string): Promise<number>;
  markMessagesAsRead(orderId: string, userId: string): Promise<boolean>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = randomUUID();
    
    const user: User = {
      id,
      email: insertUser.email,
      name: insertUser.name,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(users).values(user);
    return { ...user, password: "" }; // Don't return password
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    const user = result[0];
    return user ? { ...user, password: "" } : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.length > 0;
  }

  async getUsers(limit: number = 50): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
    
    return result.map(user => ({ ...user, password: "" }));
  }

  async createSession(userId: string): Promise<Session> {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session: Session = {
      id: randomUUID(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };

    await db.insert(sessions).values(session);
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);
    
    const session = result[0];
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.deleteSession(token);
      }
      return undefined;
    }
    
    return session;
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.token, token));
    return result.length > 0;
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.userId, userId));
    return result.length > 0;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return { ...user, password: "" };
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    
    const order: Order = {
      id,
      buyerId: insertOrder.buyerId,
      supplierId: insertOrder.supplierId,
      productName: insertOrder.productName,
      quantity: insertOrder.quantity,
      status: insertOrder.status || "pending",
      totalPrice: insertOrder.totalPrice,
      notes: insertOrder.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(orders).values(order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const result = await db
      .select()
      .from(orders)
      .where(or(eq(orders.buyerId, userId), eq(orders.supplierId, userId)))
      .orderBy(desc(orders.createdAt));
    
    return result;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    
    return result[0];
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    
    const message: Message = {
      id,
      orderId: insertMessage.orderId,
      senderId: insertMessage.senderId,
      receiverId: insertMessage.receiverId,
      content: insertMessage.content,
      status: insertMessage.status || "sent",
      createdAt: new Date(),
    };

    await db.insert(messages).values(message);
    
    // Create notification for receiver
    await this.createNotification({
      userId: message.receiverId,
      title: "Yeni Mesaj",
      message: "Yeni bir mesajınız var",
      type: "message",
      relatedId: message.orderId,
    });

    return message;
  }

  async getMessagesByOrder(orderId: string): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.orderId, orderId))
      .orderBy(messages.createdAt);
    
    return result;
  }

  async updateMessageStatus(messageId: string, status: string): Promise<Message | undefined> {
    const result = await db
      .update(messages)
      .set({ status })
      .where(eq(messages.id, messageId))
      .returning();
    
    return result[0];
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.status, "sent")
      ));
    
    return result.length;
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ status: "read" })
      .where(and(
        eq(messages.orderId, orderId),
        eq(messages.receiverId, userId),
        eq(messages.status, "sent")
      ));
    
    return result.length > 0;
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    
    const notification: Notification = {
      id,
      userId: insertNotification.userId,
      title: insertNotification.title,
      message: insertNotification.message,
      type: insertNotification.type,
      isRead: insertNotification.isRead || false,
      relatedId: insertNotification.relatedId,
      createdAt: new Date(),
    };

    await db.insert(notifications).values(notification);
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    return result;
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    
    return result.length > 0;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result.length;
  }
}

export const storage = new DatabaseStorage();
