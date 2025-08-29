// Mock veri servisi - Geliştirme aşaması için

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  company?: string;
  password: string;
}

export interface MockNotification {
  id: string;
  userId: string;
  type: 'ORDER_PLACED' | 'ORDER_APPROVED' | 'ORDER_REJECTED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'GENERAL';
  title: string;
  message: string;
  orderId?: string;
  productId?: string;
  isRead: boolean;
  isEmailSent: boolean;
  createdAt: string;
}

export interface MockChatRoom {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  isActive: boolean;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  receiverId: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  content: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock kullanıcılar
export const mockUsers: MockUser[] = [
  {
    id: 'buyer-1',
    email: 'alici@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    role: 'BUYER',
    company: 'Alıcı Şirket A.Ş.',
    password: '123456'
  },
  {
    id: 'seller-1',
    email: 'toptanci@example.com',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    role: 'SELLER',
    company: 'Toptancı Ltd. Şti.',
    password: '123456'
  }
];

// Mock bildirimler
export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    userId: 'seller-1',
    type: 'ORDER_PLACED',
    title: 'Yeni Sipariş!',
    message: 'Premium Kahve Çekirdekleri ürününden 50 adet sipariş aldınız.',
    orderId: 'order-1',
    productId: 'product-1',
    isRead: false,
    isEmailSent: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 saat önce
  },
  {
    id: 'notif-2',
    userId: 'buyer-1',
    type: 'ORDER_APPROVED',
    title: 'Sipariş Onaylandı!',
    message: 'Premium Kahve Çekirdekleri siparişiniz onaylandı ve hazırlanıyor.',
    orderId: 'order-1',
    productId: 'product-1',
    isRead: false,
    isEmailSent: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 saat önce
  },
  {
    id: 'notif-3',
    userId: 'seller-1',
    type: 'ORDER_PLACED',
    title: 'Yeni Sipariş!',
    message: 'Organik Zeytinyağı ürününden 25 adet sipariş aldınız.',
    orderId: 'order-2',
    productId: 'product-2',
    isRead: true,
    isEmailSent: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 gün önce
  },
  {
    id: 'notif-4',
    userId: 'buyer-1',
    type: 'ORDER_SHIPPED',
    title: 'Sipariş Kargoya Verildi!',
    message: 'Doğal Çiçek Balı siparişiniz kargoya verildi.',
    orderId: 'order-3',
    productId: 'product-3',
    isRead: true,
    isEmailSent: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 gün önce
  },
  {
    id: 'notif-5',
    userId: 'buyer-1',
    type: 'ORDER_DELIVERED',
    title: 'Sipariş Teslim Edildi!',
    message: 'Antep Fıstığı siparişiniz başarıyla teslim edildi.',
    orderId: 'order-4',
    productId: 'product-4',
    isRead: false,
    isEmailSent: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 dakika önce
  }
];

// Mock chat odaları
export const mockChatRooms: MockChatRoom[] = [
  {
    id: 'chatroom-1',
    orderId: 'order-1',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    isActive: true,
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'chatroom-2',
    orderId: 'order-2',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    isActive: true,
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

// Mock mesajlar
export const mockMessages: MockMessage[] = [
  {
    id: 'msg-1',
    chatRoomId: 'chatroom-1',
    senderId: 'buyer-1',
    receiverId: 'seller-1',
    type: 'TEXT',
    content: 'Merhaba, siparişimle ilgili bir sorunum var. Teslimat tarihi hakkında bilgi alabilir miyim?',
    isRead: true,
    isEdited: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    chatRoomId: 'chatroom-1',
    senderId: 'seller-1',
    receiverId: 'buyer-1',
    type: 'TEXT',
    content: 'Merhaba! Siparişiniz onaylandı ve hazırlanıyor. Tahmini teslimat süresi 2-3 gün.',
    isRead: true,
    isEdited: false,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-3',
    chatRoomId: 'chatroom-1',
    senderId: 'buyer-1',
    receiverId: 'seller-1',
    type: 'TEXT',
    content: 'Teşekkür ederim! Ayrıca fatura bilgilerini de gönderebilir misiniz?',
    isRead: false,
    isEdited: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-4',
    chatRoomId: 'chatroom-2',
    senderId: 'seller-1',
    receiverId: 'buyer-1',
    type: 'SYSTEM',
    content: 'Sistem Mesajı: Sipariş onaylandı ve hazırlanıyor.',
    isRead: true,
    isEdited: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-5',
    chatRoomId: 'chatroom-2',
    senderId: 'buyer-1',
    receiverId: 'seller-1',
    type: 'TEXT',
    content: 'Bu sipariş için özel paketleme yapılabilir mi?',
    isRead: false,
    isEdited: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

class MockDataService {
  private notifications: MockNotification[] = [...mockNotifications];
  private chatRooms: MockChatRoom[] = [...mockChatRooms];
  private messages: MockMessage[] = [...mockMessages];
  
  // Kullanıcı giriş kontrolü
  authenticate(email: string, password: string): MockUser | null {
    return mockUsers.find(user => user.email === email && user.password === password) || null;
  }
  
  // Kullanıcıyı getir
  getUserById(userId: string): MockUser | null {
    return mockUsers.find(user => user.id === userId) || null;
  }
  
  // Kullanıcının bildirimlerini getir
  getUserNotifications(userId: string, limit: number = 20): MockNotification[] {
    return this.notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  // Okunmamış bildirim sayısını getir
  getUnreadCount(userId: string): number {
    return this.notifications.filter(notif => notif.userId === userId && !notif.isRead).length;
  }
  
  // Bildirimi okundu olarak işaretle
  markAsRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.find(notif => 
      notif.id === notificationId && notif.userId === userId
    );
    
    if (notification) {
      notification.isRead = true;
      return true;
    }
    
    return false;
  }
  
  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead(userId: string): void {
    this.notifications
      .filter(notif => notif.userId === userId)
      .forEach(notif => notif.isRead = true);
  }
  
  // Yeni bildirim oluştur
  createNotification(data: {
    userId: string;
    type: MockNotification['type'];
    title: string;
    message: string;
    orderId?: string;
    productId?: string;
  }): MockNotification {
    const notification: MockNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      orderId: data.orderId,
      productId: data.productId,
      isRead: false,
      isEmailSent: true,
      createdAt: new Date().toISOString()
    };
    
    this.notifications.unshift(notification); // En başa ekle
    return notification;
  }
  
  // Test bildirimi oluştur
  createTestNotification(userId: string): MockNotification {
    const testMessages = [
      {
        type: 'ORDER_PLACED' as const,
        title: 'Test Sipariş Bildirimi!',
        message: 'Test ürününden 10 adet sipariş aldınız. Bu bir test bildirimidir.'
      },
      {
        type: 'ORDER_APPROVED' as const,
        title: 'Test Onay Bildirimi!',
        message: 'Test siparişiniz onaylandı! Bu bir test bildirimidir.'
      },
      {
        type: 'GENERAL' as const,
        title: 'Genel Test Bildirimi',
        message: 'Bu genel bir test bildirimidir. Sistem düzgün çalışıyor!'
      }
    ];
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    
    return this.createNotification({
      userId,
      type: randomMessage.type,
      title: randomMessage.title,
      message: randomMessage.message,
      orderId: 'test-order-' + Date.now(),
      productId: 'test-product-' + Date.now()
    });
  }

  // MESAJLAŞMA FONKSİYONLARI

  // Kullanıcının chat odalarını getir
  getChatRoomsByUser(userId: string): (MockChatRoom & { otherUser?: MockUser })[] {
    const userChatRooms = this.chatRooms
      .filter(room => room.buyerId === userId || room.sellerId === userId)
      .sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    return userChatRooms.map(room => {
      const otherUserId = room.buyerId === userId ? room.sellerId : room.buyerId;
      const otherUser = this.getUserById(otherUserId);
      
      return {
        ...room,
        otherUser: otherUser || undefined
      };
    });
  }

  // Chat odasını sipariş ID'sine göre getir
  getChatRoomByOrder(orderId: string): MockChatRoom | null {
    return this.chatRooms.find(room => room.orderId === orderId) || null;
  }

  // Yeni chat odası oluştur
  createChatRoom(data: {
    orderId: string;
    buyerId: string;
    sellerId: string;
  }): MockChatRoom {
    const chatRoom: MockChatRoom = {
      id: `chatroom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: data.orderId,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      isActive: true,
      lastMessageAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.chatRooms.push(chatRoom);
    return chatRoom;
  }

  // Chat odasının mesajlarını getir
  getMessagesByChatRoom(chatRoomId: string, limit: number = 50, offset: number = 0): MockMessage[] {
    return this.messages
      .filter(msg => msg.chatRoomId === chatRoomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Yeni mesaj oluştur
  createMessage(data: {
    chatRoomId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  }): MockMessage {
    const message: MockMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatRoomId: data.chatRoomId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      type: data.type || 'TEXT',
      content: data.content,
      isRead: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.messages.push(message);

    // Chat odasının lastMessageAt'ını güncelle
    const chatRoom = this.chatRooms.find(room => room.id === data.chatRoomId);
    if (chatRoom) {
      chatRoom.lastMessageAt = message.createdAt;
      chatRoom.updatedAt = message.createdAt;
    }

    return message;
  }

  // Mesajları okundu olarak işaretle
  markMessagesAsRead(messageIds: string[], userId: string): number {
    let updatedCount = 0;
    
    messageIds.forEach(messageId => {
      const message = this.messages.find(msg => 
        msg.id === messageId && msg.receiverId === userId
      );
      
      if (message && !message.isRead) {
        message.isRead = true;
        message.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });

    return updatedCount;
  }

  // Chat odasındaki okunmamış mesaj sayısı
  getUnreadMessageCount(chatRoomId: string, userId: string): number {
    return this.messages.filter(msg => 
      msg.chatRoomId === chatRoomId && 
      msg.receiverId === userId && 
      !msg.isRead
    ).length;
  }

  // Kullanıcının toplam okunmamış mesaj sayısı
  getTotalUnreadMessageCount(userId: string): number {
    return this.messages.filter(msg => 
      msg.receiverId === userId && !msg.isRead
    ).length;
  }
}

export const mockDataService = new MockDataService();