import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  phone: text("phone"),
  company: text("company"),
  role: text("role", { enum: ["BUYER", "SELLER", "ADMIN"] }).default("BUYER").notNull(),
  avatar_url: text("avatar_url"),
  notify_email: boolean("notify_email").default(true).notNull(),
  notify_inapp: boolean("notify_inapp").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  password_hash: true,
  created_at: true,
}).extend({
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export const updateProfileSchema = createInsertSchema(users).pick({
  first_name: true,
  last_name: true,
  phone: true,
  company: true,
  avatar_url: true,
});

export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, "Mevcut şifre gereklidir"),
  new_password: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
});

export const updatePreferencesSchema = createInsertSchema(users).pick({
  notify_email: true,
  notify_inapp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type UpdatePreferences = z.infer<typeof updatePreferencesSchema>;
