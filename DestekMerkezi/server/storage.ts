import { type User, type InsertUser, type Ticket, type InsertTicket, type Message, type InsertMessage, type UpdateTicket, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTickets(userId?: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  updateTicketStatus(id: string, update: UpdateTicket): Promise<Ticket | undefined>;

  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByTicketId(ticketId: string): Promise<Message[]>;

  getTicketStats(): Promise<{ open: number; answered: number; closed: number }>;
  
  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  searchProducts(query?: string, category?: string, minPrice?: number, maxPrice?: number, minRating?: number): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private messages: Map<string, Message>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.messages = new Map();
    this.products = new Map();

    // Create a default user and admin
    const defaultUserId = randomUUID();
    const adminUserId = randomUUID();
    
    this.users.set(defaultUserId, {
      id: defaultUserId,
      username: "user",
      password: "password",
      email: "user@example.com",
      isAdmin: "false"
    });

    this.users.set(adminUserId, {
      id: adminUserId,
      username: "admin",
      password: "admin",
      email: "admin@example.com",
      isAdmin: "true"
    });

    // Sample products for testing
    this.seedProducts();
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
      email: insertUser.email ?? null,
      isAdmin: insertUser.isAdmin ?? "false"
    };
    this.users.set(id, user);
    return user;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const now = new Date();
    const ticket: Ticket = { 
      ...insertTicket, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: insertTicket.status ?? "open",
      priority: insertTicket.priority ?? "medium",
      category: insertTicket.category ?? "other"
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async getTickets(userId?: string): Promise<Ticket[]> {
    const tickets = Array.from(this.tickets.values());
    if (userId) {
      return tickets.filter(ticket => ticket.userId === userId);
    }
    return tickets.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async updateTicketStatus(id: string, update: UpdateTicket): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { 
      ...ticket, 
      ...update, 
      updatedAt: new Date() 
    };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      isAdmin: insertMessage.isAdmin ?? "false"
    };
    this.messages.set(id, message);
    
    // Update ticket's updatedAt when new message is added
    const ticket = this.tickets.get(insertMessage.ticketId);
    if (ticket) {
      const updatedTicket = { ...ticket, updatedAt: new Date() };
      this.tickets.set(insertMessage.ticketId, updatedTicket);
    }
    
    return message;
  }

  async getMessagesByTicketId(ticketId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.ticketId === ticketId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getTicketStats(): Promise<{ open: number; answered: number; closed: number }> {
    const tickets = Array.from(this.tickets.values());
    return {
      open: tickets.filter(t => t.status === "open").length,
      answered: tickets.filter(t => t.status === "answered").length,
      closed: tickets.filter(t => t.status === "closed").length,
    };
  }

  private seedProducts() {
    const sampleProducts = [
      { name: "iPhone 14 Pro", description: "Apple'ın en yeni telefonu", price: "45000", category: "elektronik", rating: "4.8", imageUrl: "/images/iphone14.jpg", stock: "10" },
      { name: "Samsung Galaxy S23", description: "Samsung'un amiral gemisi", price: "38000", category: "elektronik", rating: "4.7", imageUrl: "/images/galaxy-s23.jpg", stock: "15" },
      { name: "Nike Air Max", description: "Rahat spor ayakkabı", price: "1200", category: "spor", rating: "4.5", imageUrl: "/images/nike-airmax.jpg", stock: "25" },
      { name: "Coca Cola 330ml", description: "Ferahlatıcı içecek", price: "8", category: "icecek", rating: "4.2", imageUrl: "/images/coca-cola.jpg", stock: "100" },
      { name: "MacBook Pro M2", description: "Yüksek performanslı dizüstü", price: "65000", category: "elektronik", rating: "4.9", imageUrl: "/images/macbook-m2.jpg", stock: "5" },
      { name: "Adidas Spor T-shirt", description: "Nefes alabilen spor t-shirt", price: "250", category: "giyim", rating: "4.3", imageUrl: "/images/adidas-tshirt.jpg", stock: "50" },
      { name: "PlayStation 5", description: "Son nesil oyun konsolu", price: "25000", category: "elektronik", rating: "4.9", imageUrl: "/images/ps5.jpg", stock: "3" },
      { name: "Türk Kahvesi 500g", description: "Geleneksel Türk kahvesi", price: "85", category: "gida", rating: "4.6", imageUrl: "/images/turk-kahvesi.jpg", stock: "40" }
    ];

    sampleProducts.forEach(productData => {
      const id = randomUUID();
      const product: Product = {
        ...productData,
        id,
        createdAt: new Date()
      };
      this.products.set(id, product);
    });
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      description: insertProduct.description ?? null,
      category: insertProduct.category ?? "diger",
      rating: insertProduct.rating ?? "0",
      imageUrl: insertProduct.imageUrl ?? null,
      stock: insertProduct.stock ?? "0"
    };
    this.products.set(id, product);
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async searchProducts(query?: string, category?: string, minPrice?: number, maxPrice?: number, minRating?: number): Promise<Product[]> {
    let products = Array.from(this.products.values());

    // Text search in name and description
    if (query) {
      const searchTerm = query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    // Category filter
    if (category && category !== "all") {
      products = products.filter(product => product.category === category);
    }

    // Price range filter
    if (minPrice !== undefined) {
      products = products.filter(product => parseFloat(product.price) >= minPrice);
    }
    if (maxPrice !== undefined) {
      products = products.filter(product => parseFloat(product.price) <= maxPrice);
    }

    // Rating filter
    if (minRating !== undefined) {
      products = products.filter(product => parseFloat(product.rating || "0") >= minRating);
    }

    return products.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
  }
}

export const storage = new MemStorage();
