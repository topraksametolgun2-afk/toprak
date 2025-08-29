import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Enums
export const userRoleEnum = pgEnum("user_role", ["BUYER", "SELLER", "ADMIN"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER_PLACED",
  "ORDER_APPROVED", 
  "ORDER_REJECTED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "GENERAL"
]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "APPROVED",
  "REJECTED", 
  "SHIPPED",
  "DELIVERED"
]);
export const messageTypeEnum = pgEnum("message_type", [
  "TEXT",
  "IMAGE",
  "FILE",
  "SYSTEM"
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("BUYER"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  phone: text("phone"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minOrderQuantity: integer("min_order_quantity").default(1),
  imageUrl: text("image_url"),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  productId: uuid("product_id").references(() => products.id),
  isRead: boolean("is_read").default(false),
  isEmailSent: boolean("is_email_sent").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chat Rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull().unique(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatRoomId: uuid("chat_room_id").references(() => chatRooms.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  receiverId: uuid("receiver_id").references(() => users.id).notNull(),
  type: messageTypeEnum("type").notNull().default("TEXT"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  isRead: boolean("is_read").default(false),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectProductSchema = createSelectSchema(products);
export const selectOrderSchema = createSelectSchema(orders);
export const selectNotificationSchema = createSelectSchema(notifications);
export const selectChatRoomSchema = createSelectSchema(chatRooms);
export const selectMessageSchema = createSelectSchema(messages);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type NewProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type NewOrder = z.infer<typeof insertOrderSchema>;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = z.infer<typeof insertNotificationSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type NewChatRoom = z.infer<typeof insertChatRoomSchema>;
export type Message = typeof messages.$inferSelect;
export type NewMessage = z.infer<typeof insertMessageSchema>;

// Additional types for API responses
export type ProductWithSeller = Product & {
  seller: Pick<User, 'id' | 'firstName' | 'lastName' | 'company'>;
};

export type ProductSearchParams = {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc' | 'stock_desc';
  page?: number;
  limit?: number;
};

export type ProductSearchResponse = {
  items: ProductWithSeller[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

// Enum types
export type NotificationType = "ORDER_PLACED" | "ORDER_APPROVED" | "ORDER_REJECTED" | "ORDER_SHIPPED" | "ORDER_DELIVERED" | "GENERAL";
export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "SHIPPED" | "DELIVERED";
export type UserRole = "BUYER" | "SELLER" | "ADMIN";
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
