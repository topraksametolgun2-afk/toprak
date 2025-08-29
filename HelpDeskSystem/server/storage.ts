import { type User, type InsertUser, type UpdateProfile, type UpdatePassword, type UpdateNotification, type Ticket, type InsertTicket, type TicketReply, type InsertTicketReply, type Product, type InsertProduct, type Review, type InsertReview, type UpdateReview } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, profile: UpdateProfile): Promise<User | undefined>;
  updateUserProfileImage(userId: string, profileImage: string): Promise<User | undefined>;
  updateUserPassword(userId: string, newPassword: string): Promise<boolean>;
  updateUserNotifications(userId: string, notifications: UpdateNotification): Promise<User | undefined>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicketsByUserId(userId: string): Promise<Ticket[]>;
  getAllTickets(): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | undefined>;
  updateTicketStatus(id: string, status: string): Promise<Ticket | undefined>;
  
  // Reply operations
  createTicketReply(reply: InsertTicketReply): Promise<TicketReply>;
  getRepliesByTicketId(ticketId: string): Promise<TicketReply[]>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Review operations
  getReviewsByProductId(productId: string): Promise<Review[]>;
  getReviewsByUserId(userId: string): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: UpdateReview): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  getAverageRating(productId: string): Promise<{ average: number; count: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private replies: Map<string, TicketReply>;
  private products: Map<string, Product>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.replies = new Map();
    this.products = new Map();
    this.reviews = new Map();
    
    this.seedProducts();
    
    // Add test admin user
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      username: "admin",
      password: "admin123",
      email: "admin@example.com",
      role: "admin",
      firstName: "Admin",
      lastName: "Kullanıcı",
      phone: null,
      companyName: "Destek Merkezi",
      profileImage: null,
      emailNotifications: true,
      appNotifications: true,
      updatedAt: new Date()
    };
    this.users.set(adminId, adminUser);
    
    // Add test regular user
    const userId = randomUUID();
    const testUser: User = {
      id: userId,
      username: "ahmet",
      password: "123456",
      email: "ahmet@example.com",
      role: "user",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      phone: "+90 555 123 45 67",
      companyName: "ABC Şirketi",
      profileImage: null,
      emailNotifications: true,
      appNotifications: true,
      updatedAt: new Date()
    };
    this.users.set(userId, testUser);
  }

  private seedProducts() {
    // Test ürünleri ekle
    const products = [
      {
        id: randomUUID(),
        name: "Premium Destek Paketi",
        description: "7/24 öncelikli destek, özel temsilci atama ve hızlı çözüm garantisi.",
        price: "199.99",
        category: "Destek Hizmetleri",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Kurumsal Destek Paketi",
        description: "Şirketler için özel tasarlanmış kapsamlı destek çözümü.",
        price: "499.99",
        category: "Destek Hizmetleri",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Temel Danışmanlık",
        description: "Uzman ekibimizden temel seviye danışmanlık hizmeti.",
        price: "99.99",
        category: "Danışmanlık",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Sistem Entegrasyonu",
        description: "Mevcut sistemlerinizle sorunsuz entegrasyon hizmeti.",
        price: "799.99",
        category: "Teknik Hizmetler",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Eğitim Paketi",
        description: "Kullanıcılarınız için kapsamlı eğitim programı.",
        price: "299.99",
        category: "Eğitim",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    products.forEach(product => {
      this.products.set(product.id, product as Product);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: "user",
      email: insertUser.email ?? null,
      firstName: null,
      lastName: null,
      phone: null,
      companyName: null,
      profileImage: null,
      emailNotifications: true,
      appNotifications: true,
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(userId: string, profile: UpdateProfile): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        ...profile,
        updatedAt: new Date()
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        password: newPassword,
        updatedAt: new Date()
      };
      this.users.set(userId, updatedUser);
      return true;
    }
    return false;
  }

  async updateUserProfileImage(userId: string, profileImage: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        profileImage,
        updatedAt: new Date()
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async updateUserNotifications(userId: string, notifications: UpdateNotification): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        emailNotifications: notifications.emailNotifications,
        appNotifications: notifications.appNotifications,
        updatedAt: new Date()
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const now = new Date();
    const ticket: Ticket = { 
      ...insertTicket, 
      id,
      createdAt: now,
      updatedAt: now,
      status: insertTicket.status ?? "açık",
      category: insertTicket.category ?? null,
      priority: insertTicket.priority ?? "orta"
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.userId === userId,
    ).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async updateTicketStatus(id: string, status: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (ticket) {
      const updatedTicket = { 
        ...ticket, 
        status: status as any,
        updatedAt: new Date()
      };
      this.tickets.set(id, updatedTicket);
      return updatedTicket;
    }
    return undefined;
  }

  async createTicketReply(insertReply: InsertTicketReply): Promise<TicketReply> {
    const id = randomUUID();
    const reply: TicketReply = { 
      ...insertReply, 
      id,
      createdAt: new Date(),
      isAdminReply: insertReply.isAdminReply ?? "false"
    };
    this.replies.set(id, reply);
    return reply;
  }

  async getRepliesByTicketId(ticketId: string): Promise<TicketReply[]> {
    return Array.from(this.replies.values()).filter(
      (reply) => reply.ticketId === ticketId,
    ).sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: insertProduct.isActive ?? true,
      category: insertProduct.category ?? null,
      imageUrl: insertProduct.imageUrl ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = {
        ...product,
        ...productData,
        updatedAt: new Date()
      };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Review operations
  async getReviewsByProductId(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId,
    ).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId,
    ).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getReviewById(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: string, reviewData: UpdateReview): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (review) {
      const updatedReview = {
        ...review,
        ...reviewData,
        updatedAt: new Date()
      };
      this.reviews.set(id, updatedReview);
      return updatedReview;
    }
    return undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const reviews = Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
    
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: Math.round((total / reviews.length) * 10) / 10, // 1 ondalık basamak
      count: reviews.length
    };
  }
}

export const storage = new MemStorage();
