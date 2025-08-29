import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // 'admin', 'customer'
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sku: text("sku").notNull().unique(),
  categoryId: varchar("category_id").references(() => categories.id),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  currentStock: integer("current_stock").notNull().default(0),
  criticalLevel: integer("critical_level").notNull().default(10),
  reservedStock: integer("reserved_stock").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  type: text("type").notNull(), // 'in', 'out', 'adjustment'
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(), // 'purchase', 'sale', 'adjustment', 'return'
  notes: text("notes"),
  userId: varchar("user_id").references(() => users.id),
  orderId: varchar("order_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippings = pgTable("shippings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  trackingNumber: text("tracking_number").notNull().unique(),
  carrierName: text("carrier_name").notNull().default("Aras Kargo"),
  shippingStatus: text("shipping_status").notNull().default("preparing"), // 'preparing', 'shipped', 'in_transit', 'delivered', 'returned'
  shippedAt: timestamp("shipped_at"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShippingSchema = createInsertSchema(shippings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Shipping update schema
export const updateShippingSchema = z.object({
  orderId: z.string(),
  shippingStatus: z.enum(["preparing", "shipped", "in_transit", "delivered", "returned"]),
  carrierName: z.string().optional(),
  shippedAt: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  deliveredAt: z.string().optional(),
  notes: z.string().optional(),
});

// Product with inventory schema
export const updateStockSchema = z.object({
  productId: z.string(),
  currentStock: z.number().int().min(0),
  criticalLevel: z.number().int().min(0),
  notes: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertShipping = z.infer<typeof insertShippingSchema>;
export type Shipping = typeof shippings.$inferSelect;

export type UpdateStock = z.infer<typeof updateStockSchema>;
export type UpdateShipping = z.infer<typeof updateShippingSchema>;

// Combined types for API responses
export type ProductWithInventory = Product & {
  inventory: Inventory;
  category?: Category;
};

export type StockMovementWithProduct = StockMovement & {
  product: Product;
  user?: User;
};

export type InventoryStats = {
  totalProducts: number;
  inStock: number;
  criticalStock: number;
  outOfStock: number;
};

// Combined types for API responses
export type OrderWithShipping = Order & {
  shipping?: Shipping;
  user?: User;
};

export type ShippingWithOrder = Shipping & {
  order: Order;
};

export type ShippingStats = {
  totalOrders: number;
  preparing: number;
  shipped: number;
  delivered: number;
  inTransit: number;
};
