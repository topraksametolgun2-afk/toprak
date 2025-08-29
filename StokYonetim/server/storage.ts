import { 
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Inventory,
  type InsertInventory,
  type StockMovement,
  type InsertStockMovement,
  type Order,
  type InsertOrder,
  type Shipping,
  type InsertShipping,
  type ProductWithInventory,
  type StockMovementWithProduct,
  type InventoryStats,
  type UpdateStock,
  type UpdateShipping,
  type OrderWithShipping,
  type ShippingWithOrder,
  type ShippingStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getProducts(): Promise<ProductWithInventory[]>;
  getProduct(id: string): Promise<ProductWithInventory | undefined>;
  getProductBySku(sku: string): Promise<ProductWithInventory | undefined>;
  createProduct(product: InsertProduct, inventory: InsertInventory): Promise<ProductWithInventory>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<ProductWithInventory>;
  deleteProduct(id: string): Promise<void>;

  // Inventory methods
  getInventoryStats(): Promise<InventoryStats>;
  getInventory(productId: string): Promise<Inventory | undefined>;
  updateStock(update: UpdateStock): Promise<Inventory>;
  getCriticalStockProducts(): Promise<ProductWithInventory[]>;

  // Stock movement methods
  getStockMovements(limit?: number): Promise<StockMovementWithProduct[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // Order methods
  getOrders(): Promise<OrderWithShipping[]>;
  getOrder(id: string): Promise<OrderWithShipping | undefined>;
  getUserOrders(userId: string): Promise<OrderWithShipping[]>;
  createOrder(order: InsertOrder): Promise<OrderWithShipping>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  processOrderInventory(orderId: string, items: any[]): Promise<void>;
  
  // Shipping methods
  getShippings(): Promise<ShippingWithOrder[]>;
  getShipping(orderId: string): Promise<Shipping | undefined>;
  getShippingStats(): Promise<ShippingStats>;
  createShipping(shipping: InsertShipping): Promise<Shipping>;
  updateShipping(update: UpdateShipping): Promise<Shipping>;
  generateTrackingNumber(): string;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private inventory: Map<string, Inventory>;
  private stockMovements: Map<string, StockMovement>;
  private orders: Map<string, Order>;
  private shippings: Map<string, Shipping>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.inventory = new Map();
    this.stockMovements = new Map();
    this.orders = new Map();
    this.shippings = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create categories
    const electronics: Category = {
      id: randomUUID(),
      name: "Elektronik",
      slug: "elektronik"
    };
    this.categories.set(electronics.id, electronics);

    const computers: Category = {
      id: randomUUID(),
      name: "Bilgisayar",
      slug: "bilgisayar"
    };
    this.categories.set(computers.id, computers);

    // Create sample products with inventory
    const products = [
      {
        product: {
          id: randomUUID(),
          name: "Samsung Galaxy S24",
          description: "En yeni Samsung akıllı telefon",
          price: "25000.00",
          sku: "SG24-128-BLK",
          categoryId: electronics.id,
          imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        inventory: {
          id: randomUUID(),
          currentStock: 25,
          criticalLevel: 10,
          reservedStock: 0,
          lastUpdated: new Date()
        }
      },
      {
        product: {
          id: randomUUID(),
          name: "MacBook Pro 14\"",
          description: "Apple MacBook Pro 14 inç",
          price: "45000.00",
          sku: "MBP14-512-SLV",
          categoryId: computers.id,
          imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        inventory: {
          id: randomUUID(),
          currentStock: 8,
          criticalLevel: 10,
          reservedStock: 0,
          lastUpdated: new Date()
        }
      },
      {
        product: {
          id: randomUUID(),
          name: "Sony WH-1000XM5",
          description: "Kablosuz gürültü önleyici kulaklık",
          price: "8500.00",
          sku: "SWH1000-BLK",
          categoryId: electronics.id,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        inventory: {
          id: randomUUID(),
          currentStock: 0,
          criticalLevel: 5,
          reservedStock: 0,
          lastUpdated: new Date()
        }
      },
      {
        product: {
          id: randomUUID(),
          name: "Apple Watch Series 9",
          description: "Apple Watch Series 9 45mm",
          price: "12000.00",
          sku: "AW9-45-BLU",
          categoryId: electronics.id,
          imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300&h=300&fit=crop",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        inventory: {
          id: randomUUID(),
          currentStock: 156,
          criticalLevel: 20,
          reservedStock: 0,
          lastUpdated: new Date()
        }
      }
    ];

    products.forEach(({ product, inventory }) => {
      this.products.set(product.id, product);
      const inventoryWithProductId: Inventory = {
        ...inventory,
        productId: product.id
      };
      this.inventory.set(product.id, inventoryWithProductId);
    });

    // Create sample stock movements
    const movements: StockMovement[] = [
      {
        id: randomUUID(),
        productId: products[0].product.id,
        type: "in",
        quantity: 50,
        reason: "purchase",
        notes: "Yeni stok alımı",
        userId: adminUser.id,
        orderId: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: randomUUID(),
        productId: products[1].product.id,
        type: "out",
        quantity: -2,
        reason: "sale",
        notes: "Sipariş #1234",
        userId: null,
        orderId: "ORDER-1234",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        id: randomUUID(),
        productId: products[2].product.id,
        type: "adjustment",
        quantity: -5,
        reason: "adjustment",
        notes: "Stok düzeltmesi - hasarlı ürün",
        userId: adminUser.id,
        orderId: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    movements.forEach(movement => {
      this.stockMovements.set(movement.id, movement);
    });

    // Create sample customer
    const customerUser: User = {
      id: randomUUID(),
      username: "customer1",
      password: "customer123",
      role: "customer",
      createdAt: new Date(),
    };
    this.users.set(customerUser.id, customerUser);

    // Create sample orders
    const sampleOrders: Order[] = [
      {
        id: randomUUID(),
        userId: customerUser.id,
        status: "delivered",
        total: "25000.00",
        items: [{ productId: products[0].product.id, quantity: 1, price: "25000.00" }],
        shippingAddress: { 
          address: "Atatürk Cd. No:123 Kadıköy/İstanbul",
          phone: "0532 123 45 67",
          name: "Ali Veli"
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        userId: customerUser.id,
        status: "shipped",
        total: "45000.00",
        items: [{ productId: products[1].product.id, quantity: 1, price: "45000.00" }],
        shippingAddress: { 
          address: "Mehmet Akif Cd. No:456 Beşiktaş/İstanbul",
          phone: "0532 987 65 43",
          name: "Fatma Şahin"
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        userId: customerUser.id,
        status: "preparing",
        total: "8500.00",
        items: [{ productId: products[2].product.id, quantity: 1, price: "8500.00" }],
        shippingAddress: { 
          address: "Cumhuriyet Cd. No:789 Şişli/İstanbul",
          phone: "0532 555 77 99",
          name: "Ahmet Demir"
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleOrders.forEach(order => {
      this.orders.set(order.id, order);
    });

    // Create sample shippings
    const sampleShippings: Shipping[] = [
      {
        id: randomUUID(),
        orderId: sampleOrders[0].id,
        trackingNumber: "AR2024010001",
        carrierName: "Aras Kargo",
        shippingStatus: "delivered",
        shippedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: "Başarıyla teslim edildi",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        orderId: sampleOrders[1].id,
        trackingNumber: "AR2024010002",
        carrierName: "Aras Kargo",
        shippingStatus: "in_transit",
        shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        deliveredAt: null,
        notes: "Dağıtım merkezinde",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        orderId: sampleOrders[2].id,
        trackingNumber: "AR2024010003",
        carrierName: "Aras Kargo",
        shippingStatus: "preparing",
        shippedAt: null,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        deliveredAt: null,
        notes: "Paketleme aşamasında",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleShippings.forEach(shipping => {
      this.shippings.set(shipping.orderId, shipping);
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
      role: insertUser.role || "customer", 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getProducts(): Promise<ProductWithInventory[]> {
    const productsWithInventory: ProductWithInventory[] = [];
    
    for (const product of Array.from(this.products.values())) {
      const inventory = this.inventory.get(product.id);
      const category = product.categoryId ? this.categories.get(product.categoryId) : undefined;
      
      if (inventory) {
        productsWithInventory.push({
          ...product,
          inventory,
          category
        });
      }
    }
    
    return productsWithInventory;
  }

  async getProduct(id: string): Promise<ProductWithInventory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const inventory = this.inventory.get(id);
    const category = product.categoryId ? this.categories.get(product.categoryId) : undefined;
    
    if (!inventory) return undefined;
    
    return {
      ...product,
      inventory,
      category
    };
  }

  async getProductBySku(sku: string): Promise<ProductWithInventory | undefined> {
    const product = Array.from(this.products.values()).find(p => p.sku === sku);
    if (!product) return undefined;
    
    return this.getProduct(product.id);
  }

  async createProduct(insertProduct: InsertProduct, insertInventory: InsertInventory): Promise<ProductWithInventory> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      description: insertProduct.description || null,
      categoryId: insertProduct.categoryId || null,
      imageUrl: insertProduct.imageUrl || null,
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : true,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const inventory: Inventory = {
      currentStock: insertInventory.currentStock || 0,
      criticalLevel: insertInventory.criticalLevel || 10,
      reservedStock: insertInventory.reservedStock || 0,
      id: randomUUID(),
      productId: id,
      lastUpdated: new Date()
    };
    
    this.products.set(id, product);
    this.inventory.set(id, inventory);
    
    const category = product.categoryId ? this.categories.get(product.categoryId) : undefined;
    
    return {
      ...product,
      inventory,
      category
    };
  }

  async updateProduct(id: string, updateProduct: Partial<InsertProduct>): Promise<ProductWithInventory> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateProduct,
      updatedAt: new Date()
    };
    
    this.products.set(id, updatedProduct);
    
    const inventory = this.inventory.get(id)!;
    const category = updatedProduct.categoryId ? this.categories.get(updatedProduct.categoryId) : undefined;
    
    return {
      ...updatedProduct,
      inventory,
      category
    };
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
    this.inventory.delete(id);
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const inventories = Array.from(this.inventory.values());
    
    return {
      totalProducts: inventories.length,
      inStock: inventories.filter(inv => inv.currentStock > inv.criticalLevel).length,
      criticalStock: inventories.filter(inv => inv.currentStock > 0 && inv.currentStock <= inv.criticalLevel).length,
      outOfStock: inventories.filter(inv => inv.currentStock === 0).length
    };
  }

  async getInventory(productId: string): Promise<Inventory | undefined> {
    return this.inventory.get(productId);
  }

  async updateStock(update: UpdateStock): Promise<Inventory> {
    const existingInventory = this.inventory.get(update.productId);
    if (!existingInventory) {
      throw new Error("Inventory not found");
    }

    const updatedInventory: Inventory = {
      ...existingInventory,
      currentStock: update.currentStock,
      criticalLevel: update.criticalLevel,
      lastUpdated: new Date()
    };

    this.inventory.set(update.productId, updatedInventory);

    // Create stock movement record
    const movement: StockMovement = {
      id: randomUUID(),
      productId: update.productId,
      type: "adjustment",
      quantity: update.currentStock - existingInventory.currentStock,
      reason: "adjustment",
      notes: update.notes || "Stok güncelleme",
      userId: null, // TODO: Get from authentication context
      orderId: null,
      createdAt: new Date()
    };

    this.stockMovements.set(movement.id, movement);

    return updatedInventory;
  }

  async getCriticalStockProducts(): Promise<ProductWithInventory[]> {
    const products = await this.getProducts();
    return products.filter(p => 
      p.inventory.currentStock > 0 && 
      p.inventory.currentStock <= p.inventory.criticalLevel
    );
  }

  async getStockMovements(limit = 50): Promise<StockMovementWithProduct[]> {
    const movements = Array.from(this.stockMovements.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);

    return movements.map(movement => {
      const product = this.products.get(movement.productId)!;
      const user = movement.userId ? this.users.get(movement.userId) : undefined;
      
      return {
        ...movement,
        product,
        user
      };
    });
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const id = randomUUID();
    const movement: StockMovement = {
      ...insertMovement,
      notes: insertMovement.notes || null,
      userId: insertMovement.userId || null,
      orderId: insertMovement.orderId || null,
      id,
      createdAt: new Date()
    };
    
    this.stockMovements.set(id, movement);
    return movement;
  }

  async getOrders(): Promise<OrderWithShipping[]> {
    const orders = Array.from(this.orders.values());
    
    return orders.map(order => {
      const shipping = this.shippings.get(order.id);
      const user = order.userId ? this.users.get(order.userId) : undefined;
      
      return {
        ...order,
        shipping,
        user
      };
    });
  }

  async getOrder(id: string): Promise<OrderWithShipping | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const shipping = this.shippings.get(id);
    const user = order.userId ? this.users.get(order.userId) : undefined;
    
    return {
      ...order,
      shipping,
      user
    };
  }

  async getUserOrders(userId: string): Promise<OrderWithShipping[]> {
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return userOrders.map(order => {
      const shipping = this.shippings.get(order.id);
      const user = this.users.get(userId);
      
      return {
        ...order,
        shipping,
        user
      };
    });
  }

  async createOrder(insertOrder: InsertOrder): Promise<OrderWithShipping> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      status: insertOrder.status || "pending",
      userId: insertOrder.userId || null,
      shippingAddress: insertOrder.shippingAddress || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.orders.set(id, order);

    // Auto-create shipping record with tracking number
    const trackingNumber = this.generateTrackingNumber();
    const shipping: Shipping = {
      id: randomUUID(),
      orderId: id,
      trackingNumber,
      carrierName: "Aras Kargo",
      shippingStatus: "preparing",
      shippedAt: null,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      deliveredAt: null,
      notes: "Sipariş hazırlanıyor",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.shippings.set(id, shipping);

    const user = order.userId ? this.users.get(order.userId) : undefined;
    
    return {
      ...order,
      shipping,
      user
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }
    
    const updatedOrder: Order = {
      ...existingOrder,
      status,
      updatedAt: new Date()
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async processOrderInventory(orderId: string, items: any[]): Promise<void> {
    for (const item of items) {
      const inventory = this.inventory.get(item.productId);
      if (!inventory) {
        throw new Error(`Inventory not found for product ${item.productId}`);
      }
      
      if (inventory.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      
      // Update inventory
      const updatedInventory: Inventory = {
        ...inventory,
        currentStock: inventory.currentStock - item.quantity,
        lastUpdated: new Date()
      };
      
      this.inventory.set(item.productId, updatedInventory);
      
      // Create stock movement
      const movement: StockMovement = {
        id: randomUUID(),
        productId: item.productId,
        type: "out",
        quantity: -item.quantity,
        reason: "sale",
        notes: `Sipariş #${orderId}`,
        userId: null,
        orderId,
        createdAt: new Date()
      };
      
      this.stockMovements.set(movement.id, movement);
    }
  }

  // Shipping methods
  async getShippings(): Promise<ShippingWithOrder[]> {
    const shippings = Array.from(this.shippings.values());
    
    return shippings.map(shipping => {
      const order = this.orders.get(shipping.orderId)!;
      
      return {
        ...shipping,
        order
      };
    });
  }

  async getShipping(orderId: string): Promise<Shipping | undefined> {
    return this.shippings.get(orderId);
  }

  async getShippingStats(): Promise<ShippingStats> {
    const shippings = Array.from(this.shippings.values());
    
    return {
      totalOrders: shippings.length,
      preparing: shippings.filter(s => s.shippingStatus === "preparing").length,
      shipped: shippings.filter(s => s.shippingStatus === "shipped").length,
      delivered: shippings.filter(s => s.shippingStatus === "delivered").length,
      inTransit: shippings.filter(s => s.shippingStatus === "in_transit").length
    };
  }

  async createShipping(insertShipping: InsertShipping): Promise<Shipping> {
    const id = randomUUID();
    const shipping: Shipping = {
      ...insertShipping,
      trackingNumber: insertShipping.trackingNumber || this.generateTrackingNumber(),
      carrierName: insertShipping.carrierName || "Aras Kargo",
      shippingStatus: insertShipping.shippingStatus || "preparing",
      shippedAt: insertShipping.shippedAt ? new Date(insertShipping.shippedAt) : null,
      estimatedDelivery: insertShipping.estimatedDelivery ? new Date(insertShipping.estimatedDelivery) : null,
      deliveredAt: insertShipping.deliveredAt ? new Date(insertShipping.deliveredAt) : null,
      notes: insertShipping.notes || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.shippings.set(shipping.orderId, shipping);
    return shipping;
  }

  async updateShipping(update: UpdateShipping): Promise<Shipping> {
    const existingShipping = this.shippings.get(update.orderId);
    if (!existingShipping) {
      throw new Error("Shipping not found");
    }

    const updatedShipping: Shipping = {
      ...existingShipping,
      shippingStatus: update.shippingStatus,
      carrierName: update.carrierName || existingShipping.carrierName,
      shippedAt: update.shippedAt ? new Date(update.shippedAt) : existingShipping.shippedAt,
      estimatedDelivery: update.estimatedDelivery ? new Date(update.estimatedDelivery) : existingShipping.estimatedDelivery,
      deliveredAt: update.deliveredAt ? new Date(update.deliveredAt) : existingShipping.deliveredAt,
      notes: update.notes || existingShipping.notes,
      updatedAt: new Date()
    };

    this.shippings.set(update.orderId, updatedShipping);

    // Update order status based on shipping status
    const order = this.orders.get(update.orderId);
    if (order) {
      let orderStatus = order.status;
      if (update.shippingStatus === "shipped") {
        orderStatus = "shipped";
      } else if (update.shippingStatus === "delivered") {
        orderStatus = "delivered";
      } else if (update.shippingStatus === "preparing") {
        orderStatus = "preparing";
      }

      if (orderStatus !== order.status) {
        await this.updateOrderStatus(update.orderId, orderStatus);
      }
    }

    return updatedShipping;
  }

  generateTrackingNumber(): string {
    const prefix = "AR"; // Aras Kargo prefix
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(Math.random() * 900000) + 100000; // 6 digit random number
    return `${prefix}${year}${randomSuffix.toString().padStart(6, "0")}`;
  }
}

export const storage = new MemStorage();
