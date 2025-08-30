import { type User, type InsertUser, type Ticket, type InsertTicket, type StockItem, type InsertStockItem, type Activity, type InsertActivity } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ticket methods
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  // Stock methods
  getStockItems(): Promise<StockItem[]>;
  getStockItem(id: string): Promise<StockItem | undefined>;
  createStockItem(item: InsertStockItem): Promise<StockItem>;
  updateStockItem(id: string, updates: Partial<StockItem>): Promise<StockItem | undefined>;
  deleteStockItem(id: string): Promise<boolean>;
  
  // Activity methods
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalTickets: number;
    activeUsers: number;
    stockItems: number;
    resolvedTickets: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private stockItems: Map<string, StockItem>;
  private activities: Map<string, Activity>;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.stockItems = new Map();
    this.activities = new Map();
    
    // Initialize with some demo data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
      email: "admin@toprak.com",
      name: "Admin User",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample tickets
    const tickets: Ticket[] = [
      {
        id: randomUUID(),
        subject: "Giriş sorunu",
        description: "Sisteme giriş yapamıyorum",
        status: "bekliyor",
        priority: "normal",
        userId: adminUser.id,
        assignedTo: undefined,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: randomUUID(),
        subject: "Ürün eksik",
        description: "Stokta olmayan ürün görünüyor",
        status: "cozuldu",
        priority: "normal",
        userId: adminUser.id,
        assignedTo: adminUser.id,
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-14"),
      },
      {
        id: randomUUID(),
        subject: "Sistem yavaş",
        description: "Sayfa yükleme süreleri çok uzun",
        status: "acil",
        priority: "yuksek",
        userId: adminUser.id,
        assignedTo: undefined,
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-14"),
      },
    ];
    
    tickets.forEach(ticket => this.tickets.set(ticket.id, ticket));

    // Create sample stock items
    const stockItems: StockItem[] = [
      {
        id: randomUUID(),
        name: "Laptop Dell XPS 13",
        description: "13 inç ultrabook",
        quantity: 15,
        minQuantity: 5,
        price: 2500000, // 25,000 TL in cents
        category: "Elektronik",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Mouse Logitech MX",
        description: "Kablosuz mouse",
        quantity: 25,
        minQuantity: 10,
        price: 15000, // 150 TL in cents
        category: "Aksesuar",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    stockItems.forEach(item => this.stockItems.set(item.id, item));

    // Create sample activities
    const activities: Activity[] = [
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: "yeni bir ticket oluşturdu",
        details: { ticketId: tickets[0].id },
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: "ticket #1234'ü çözdü",
        details: { ticketId: tickets[1].id },
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: "stok güncelleme yaptı",
        details: { stockItemId: stockItems[0].id },
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: "sisteme giriş yaptı",
        details: {},
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ];
    
    activities.forEach(activity => this.activities.set(activity.id, activity));
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
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      ...insertTicket,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates, updatedAt: new Date() };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }

  async getStockItems(): Promise<StockItem[]> {
    return Array.from(this.stockItems.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  async getStockItem(id: string): Promise<StockItem | undefined> {
    return this.stockItems.get(id);
  }

  async createStockItem(insertStockItem: InsertStockItem): Promise<StockItem> {
    const id = randomUUID();
    const stockItem: StockItem = {
      ...insertStockItem,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stockItems.set(id, stockItem);
    return stockItem;
  }

  async updateStockItem(id: string, updates: Partial<StockItem>): Promise<StockItem | undefined> {
    const stockItem = this.stockItems.get(id);
    if (!stockItem) return undefined;
    
    const updatedStockItem = { ...stockItem, ...updates, updatedAt: new Date() };
    this.stockItems.set(id, updatedStockItem);
    return updatedStockItem;
  }

  async deleteStockItem(id: string): Promise<boolean> {
    return this.stockItems.delete(id);
  }

  async getActivities(limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getDashboardStats(): Promise<{
    totalTickets: number;
    activeUsers: number;
    stockItems: number;
    resolvedTickets: number;
  }> {
    const totalTickets = this.tickets.size;
    const activeUsers = this.users.size;
    const stockItems = this.stockItems.size;
    const resolvedTickets = Array.from(this.tickets.values()).filter(
      ticket => ticket.status === 'cozuldu'
    ).length;

    return {
      totalTickets,
      activeUsers,
      stockItems,
      resolvedTickets,
    };
  }
}

export const storage = new MemStorage();
