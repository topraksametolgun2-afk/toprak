import { db } from "../../shared/schema.js";
import { notifications, orders, products, users } from "../../shared/schema.js";
import type { 
  NewNotification, 
  NotificationType, 
  User, 
  Order, 
  Product 
} from "../../shared/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { emailService } from "./emailService.js";

// Türkçe bildirim mesajları
const NOTIFICATION_MESSAGES = {
  ORDER_PLACED: {
    title: "Yeni Sipariş!",
    message: (productName: string, quantity: number) => 
      `${productName} ürününden ${quantity} adet sipariş aldınız.`,
    emailSubject: "Yeni Sipariş Bildirimi",
    emailTemplate: (productName: string, quantity: number, buyerName: string) => `
      <h2>Merhaba,</h2>
      <p><strong>${buyerName}</strong> müşterinizden yeni bir sipariş aldınız:</p>
      <ul>
        <li><strong>Ürün:</strong> ${productName}</li>
        <li><strong>Miktar:</strong> ${quantity} adet</li>
      </ul>
      <p>Siparişinizi yönetmek için panel üzerinden giriş yapabilirsiniz.</p>
      <p>Teşekkürler!</p>
    `
  },
  ORDER_APPROVED: {
    title: "Sipariş Onaylandı!",
    message: (productName: string) => 
      `${productName} siparişiniz onaylandı ve hazırlanıyor.`,
    emailSubject: "Siparişiniz Onaylandı",
    emailTemplate: (productName: string, quantity: number) => `
      <h2>Merhaba,</h2>
      <p>Siparişiniz onaylandı!</p>
      <ul>
        <li><strong>Ürün:</strong> ${productName}</li>
        <li><strong>Miktar:</strong> ${quantity} adet</li>
      </ul>
      <p>Siparişiniz kısa süre içinde hazırlanacak ve size ulaştırılacaktır.</p>
      <p>Teşekkürler!</p>
    `
  },
  ORDER_REJECTED: {
    title: "Sipariş Reddedildi",
    message: (productName: string, reason?: string) => 
      `${productName} siparişiniz reddedildi.${reason ? ` Sebep: ${reason}` : ''}`,
    emailSubject: "Sipariş Reddedildi",
    emailTemplate: (productName: string, quantity: number, reason?: string) => `
      <h2>Merhaba,</h2>
      <p>Maalesef siparişiniz reddedildi:</p>
      <ul>
        <li><strong>Ürün:</strong> ${productName}</li>
        <li><strong>Miktar:</strong> ${quantity} adet</li>
        ${reason ? `<li><strong>Sebep:</strong> ${reason}</li>` : ''}
      </ul>
      <p>Başka ürünlere göz atmak için lütfen sitemizi ziyaret edin.</p>
    `
  },
  ORDER_SHIPPED: {
    title: "Sipariş Kargoya Verildi!",
    message: (productName: string) => 
      `${productName} siparişiniz kargoya verildi.`,
    emailSubject: "Siparişiniz Kargoya Verildi",
    emailTemplate: (productName: string, quantity: number) => `
      <h2>Merhaba,</h2>
      <p>Siparişiniz kargoya verildi!</p>
      <ul>
        <li><strong>Ürün:</strong> ${productName}</li>
        <li><strong>Miktar:</strong> ${quantity} adet</li>
      </ul>
      <p>Siparişiniz en kısa sürede adresinize ulaşacaktır.</p>
      <p>Teşekkürler!</p>
    `
  },
  ORDER_DELIVERED: {
    title: "Sipariş Teslim Edildi!",
    message: (productName: string) => 
      `${productName} siparişiniz başarıyla teslim edildi.`,
    emailSubject: "Siparişiniz Teslim Edildi",
    emailTemplate: (productName: string, quantity: number) => `
      <h2>Merhaba,</h2>
      <p>Siparişiniz başarıyla teslim edildi!</p>
      <ul>
        <li><strong>Ürün:</strong> ${productName}</li>
        <li><strong>Miktar:</strong> ${quantity} adet</li>
      </ul>
      <p>Alışveriş deneyiminizden memnun kaldıysanız, değerlendirme yapabilirsiniz.</p>
      <p>Teşekkürler!</p>
    `
  },
  GENERAL: {
    title: "Bildirim",
    message: (content: string) => content,
    emailSubject: "Genel Bildirim",
    emailTemplate: (content: string) => `
      <h2>Merhaba,</h2>
      <p>${content}</p>
      <p>Teşekkürler!</p>
    `
  }
};

export class NotificationService {
  
  // Bildirim oluştur
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    orderId?: string;
    productId?: string;
    customMessage?: string;
    customTitle?: string;
    sendEmail?: boolean;
  }): Promise<void> {
    try {
      let title = data.customTitle || "";
      let message = data.customMessage || "";
      
      // Eğer custom mesaj yoksa, order ve product bilgilerini al
      if (!data.customMessage && data.orderId) {
        const orderData = await this.getOrderWithDetails(data.orderId);
        if (orderData) {
          const template = NOTIFICATION_MESSAGES[data.type];
          title = template.title;
          
          switch (data.type) {
            case "ORDER_PLACED":
              message = template.message(orderData.product.name, orderData.order.quantity);
              break;
            case "ORDER_APPROVED":
            case "ORDER_SHIPPED":
            case "ORDER_DELIVERED":
              message = template.message(orderData.product.name);
              break;
            case "ORDER_REJECTED":
              message = template.message(orderData.product.name, orderData.order.notes);
              break;
          }
        }
      }
      
      // Veritabanına bildirim kaydet
      const [notification] = await db.insert(notifications).values({
        userId: data.userId,
        type: data.type,
        title,
        message,
        orderId: data.orderId,
        productId: data.productId,
        isEmailSent: false
      }).returning();
      
      // Email gönder
      if (data.sendEmail !== false) {
        await this.sendNotificationEmail(notification.id);
      }
      
    } catch (error) {
      console.error("Bildirim oluşturma hatası:", error);
      throw error;
    }
  }
  
  // Kullanıcının bildirimlerini getir
  async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
  
  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }
  
  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
  
  // Okunmamış bildirim sayısını getir
  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    return result.length;
  }
  
  // Order detaylarını getir (bildirim oluşturmak için)
  private async getOrderWithDetails(orderId: string) {
    const result = await db
      .select({
        order: orders,
        product: products,
        buyer: users,
        seller: users
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.buyerId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);
      
    return result[0] || null;
  }
  
  // Email gönderimi
  private async sendNotificationEmail(notificationId: string): Promise<void> {
    try {
      const notificationData = await db
        .select({
          notification: notifications,
          user: users,
          order: orders,
          product: products
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.userId, users.id))
        .leftJoin(orders, eq(notifications.orderId, orders.id))
        .leftJoin(products, eq(notifications.productId, products.id))
        .where(eq(notifications.id, notificationId))
        .limit(1);
        
      if (!notificationData[0] || !notificationData[0].user?.email) {
        return;
      }
      
      const { notification, user, order, product } = notificationData[0];
      const template = NOTIFICATION_MESSAGES[notification.type];
      
      let emailContent = template.emailTemplate("", 0);
      
      if (order && product) {
        switch (notification.type) {
          case "ORDER_PLACED":
            emailContent = template.emailTemplate(product.name, order.quantity, user.firstName || "");
            break;
          case "ORDER_APPROVED":
          case "ORDER_SHIPPED":
          case "ORDER_DELIVERED":
          case "ORDER_REJECTED":
            emailContent = template.emailTemplate(product.name, order.quantity, order.notes);
            break;
        }
      }
      
      await emailService.sendEmail({
        to: user.email,
        subject: template.emailSubject,
        html: emailContent
      });
      
      // Email gönderildi olarak işaretle
      await db
        .update(notifications)
        .set({ isEmailSent: true })
        .where(eq(notifications.id, notificationId));
        
    } catch (error) {
      console.error("Email gönderme hatası:", error);
    }
  }
  
  // Sipariş durumu değiştiğinde bildirim oluştur
  async handleOrderStatusChange(orderId: string, newStatus: string, oldStatus: string): Promise<void> {
    const orderData = await this.getOrderWithDetails(orderId);
    if (!orderData) return;
    
    const { order, product, buyer, seller } = orderData;
    
    // Alıcıya bildirim gönder
    switch (newStatus) {
      case "APPROVED":
        await this.createNotification({
          userId: order.buyerId,
          type: "ORDER_APPROVED",
          orderId: order.id,
          productId: product?.id
        });
        break;
        
      case "REJECTED":
        await this.createNotification({
          userId: order.buyerId,
          type: "ORDER_REJECTED",
          orderId: order.id,
          productId: product?.id
        });
        break;
        
      case "SHIPPED":
        await this.createNotification({
          userId: order.buyerId,
          type: "ORDER_SHIPPED",
          orderId: order.id,
          productId: product?.id
        });
        break;
        
      case "DELIVERED":
        await this.createNotification({
          userId: order.buyerId,
          type: "ORDER_DELIVERED",
          orderId: order.id,
          productId: product?.id
        });
        break;
    }
  }
  
  // Yeni sipariş oluşturulduğunda toptancıya bildirim gönder
  async handleNewOrder(orderId: string): Promise<void> {
    const orderData = await this.getOrderWithDetails(orderId);
    if (!orderData) return;
    
    const { order, product, seller } = orderData;
    
    // Toptancıya bildirim gönder
    await this.createNotification({
      userId: order.sellerId,
      type: "ORDER_PLACED",
      orderId: order.id,
      productId: product?.id
    });
  }
}

export const notificationService = new NotificationService();