import pkg from "pg";
const { Client } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { type User, type InsertUser, type Product, type InsertProduct, type ProductFilters, type ProductsResponse, users, products } from "@shared/schema";
import { eq, and, gte, lte, ilike, desc, asc, count, or, sql } from "drizzle-orm";

const client = new Client({
  connectionString: process.env.DATABASE_URL!,
});

client.connect();
const db = drizzle(client);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(filters: ProductFilters): Promise<ProductsResponse>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getCategories(): Promise<string[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getProducts(filters: ProductFilters): Promise<ProductsResponse> {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      minRating,
      minStock,
      sort = 'newest',
      page = 1,
      limit = 20
    } = filters;

    // Build where conditions
    const conditions = [eq(products.isActive, true)];

    if (query) {
      // Use trigram similarity for better search performance and fuzzy matching
      conditions.push(
        or(
          sql`${products.name} % ${query}`,
          sql`${products.description} % ${query}`,
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()));
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()));
    }

    if (minRating !== undefined) {
      conditions.push(gte(products.averageRating, minRating.toString()));
    }

    if (minStock !== undefined) {
      conditions.push(gte(products.stock, minStock));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Build order by
    let orderBy;
    switch (sort) {
      case 'price_asc':
        orderBy = [asc(products.price)];
        break;
      case 'price_desc':
        orderBy = [desc(products.price)];
        break;
      case 'rating_desc':
        orderBy = [desc(products.averageRating), desc(products.reviewCount)];
        break;
      case 'newest':
        orderBy = [desc(products.createdAt)];
        break;
      case 'popular':
        orderBy = [desc(products.reviewCount), desc(products.averageRating)];
        break;
      default:
        orderBy = [desc(products.createdAt)];
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get products
    const items = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    return {
      items,
      total,
      page,
      pages,
      limit
    };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getCategories(): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .where(eq(products.isActive, true));
    
    return result.map(row => row.category);
  }
}

export const storage = new DbStorage();
