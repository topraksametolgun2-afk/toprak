import { type User, type NewUser, type Product, type NewProduct, type ProductWithSeller, type ProductSearchParams, type ProductSearchResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: NewUser): Promise<User>;
  
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(params: ProductSearchParams): Promise<ProductSearchResponse>;
  createProduct(product: NewProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<NewProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Additional helper methods
  getCategories(): Promise<string[]>;
  getSeller(id: string): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'company'> | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create test sellers
    const seller1: User = {
      id: randomUUID(),
      email: "seller1@example.com",
      password: "password123",
      role: "SELLER",
      firstName: "Mehmet",
      lastName: "Yılmaz", 
      company: "TechStore",
      phone: "+90 555 123 4567",
      address: "İstanbul, Türkiye",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const seller2: User = {
      id: randomUUID(),
      email: "seller2@example.com", 
      password: "password123",
      role: "SELLER",
      firstName: "Ayşe",
      lastName: "Kaya",
      company: "ElektronikDünyası",
      phone: "+90 555 234 5678",
      address: "Ankara, Türkiye",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(seller1.id, seller1);
    this.users.set(seller2.id, seller2);

    // Create test products
    const testProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Samsung Galaxy S24 Ultra",
        description: "256GB Dahili Hafıza, 12GB RAM, Triple Kamera Sistemi",
        category: "Elektronik",
        price: "32999.00",
        stock: 15,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller1.id,
        isActive: true,
        averageRating: "4.5",
        reviewCount: 128,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "MacBook Pro 16\"",
        description: "M3 Pro Chip, 18GB RAM, 512GB SSD, Liquid Retina XDR Display",
        category: "Elektronik",
        price: "89999.00",
        stock: 3,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller2.id,
        isActive: true,
        averageRating: "4.8",
        reviewCount: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "AirPods Pro 2. Nesil",
        description: "Aktif Gürültü Önleme, Spatial Audio, USB-C Şarj Kutusu",
        category: "Elektronik",
        price: "7999.00",
        stock: 25,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller1.id,
        isActive: true,
        averageRating: "4.6",
        reviewCount: 203,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Apple Watch Series 9",
        description: "45mm, GPS + Cellular, Titanyum Kasa, Spor Loop Kordon",
        category: "Elektronik", 
        price: "15999.00",
        stock: 8,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller2.id,
        isActive: true,
        averageRating: "4.7",
        reviewCount: 156,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Canon EOS R5",
        description: "45MP Full Frame, 8K Video, Image Stabilization, RF 24-105mm Lens",
        category: "Elektronik",
        price: "125999.00",
        stock: 2,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller1.id,
        isActive: true,
        averageRating: "4.9",
        reviewCount: 67,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "PlayStation 5",
        description: "1TB SSD, 4K Gaming, Ray Tracing, DualSense Controller",
        category: "Elektronik",
        price: "18999.00", 
        stock: 5,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller2.id,
        isActive: true,
        averageRating: "4.8",
        reviewCount: 342,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "iPad Pro 12.9\"",
        description: "M2 Chip, 256GB, Liquid Retina XDR, Apple Pencil Uyumlu",
        category: "Elektronik",
        price: "39999.00",
        stock: 12,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller1.id,
        isActive: true,
        averageRating: "4.6",
        reviewCount: 89,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "LG UltraWide 34\"",
        description: "3440x1440 QHD, IPS Panel, 144Hz, USB-C Hub, HDR10",
        category: "Elektronik",
        price: "24999.00",
        stock: 7,
        minOrderQuantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        sellerId: seller2.id,
        isActive: true,
        averageRating: "4.4",
        reviewCount: 76,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    testProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username,
    );
  }

  async createUser(insertUser: NewUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      role: insertUser.role || 'BUYER',
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      company: insertUser.company || null,
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(params: ProductSearchParams): Promise<ProductSearchResponse> {
    let filteredProducts = Array.from(this.products.values());

    // Filter by active status
    filteredProducts = filteredProducts.filter(p => p.isActive);

    // Search query filter
    if (params.query) {
      const queryLower = params.query.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(queryLower) || 
        (p.description && p.description.toLowerCase().includes(queryLower))
      );
    }

    // Category filter
    if (params.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }

    // Price range filter
    if (params.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) <= params.maxPrice!);
    }

    // Rating filter
    if (params.minRating !== undefined) {
      filteredProducts = filteredProducts.filter(p => 
        parseFloat(p.averageRating || "0") >= params.minRating!
      );
    }

    // Stock filter
    if (params.inStock) {
      filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }

    // Sorting
    const sort = params.sort || 'newest';
    switch (sort) {
      case 'price_asc':
        filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating_desc':
        filteredProducts.sort((a, b) => parseFloat(b.averageRating || "0") - parseFloat(a.averageRating || "0"));
        break;
      case 'name_asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock_desc':
        filteredProducts.sort((a, b) => b.stock - a.stock);
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filteredProducts.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Add seller info to products
    const productsWithSeller: ProductWithSeller[] = await Promise.all(
      paginatedProducts.map(async (product) => {
        const seller = await this.getSeller(product.sellerId);
        return {
          ...product,
          seller: seller || { id: product.sellerId, firstName: 'Unknown', lastName: 'Seller', company: null }
        };
      })
    );

    return {
      items: productsWithSeller,
      total,
      page,
      pages,
      limit,
    };
  }

  async createProduct(product: NewProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { 
      ...product,
      id,
      description: product.description || null,
      stock: product.stock || 0,
      minOrderQuantity: product.minOrderQuantity || 1,
      imageUrl: product.imageUrl || null,
      isActive: product.isActive ?? true,
      averageRating: "0",
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<NewProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    this.products.forEach(product => {
      if (product.isActive) {
        categories.add(product.category);
      }
    });
    return Array.from(categories).sort();
  }

  async getSeller(id: string): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'company'> | undefined> {
    const user = this.users.get(id);
    if (!user || user.role !== 'SELLER') return undefined;
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
    };
  }
}

export const storage = new MemStorage();
