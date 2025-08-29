import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface ChatRoom {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  isActive: boolean
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
  otherUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
    company?: string
    role: 'BUYER' | 'SELLER' | 'ADMIN'
  }
}

interface Message {
  id: string
  chatRoomId: string
  senderId: string
  receiverId: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  content: string
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  isRead: boolean
  isEdited: boolean
  createdAt: string
  updatedAt: string
}

// Chat odalarını getir
export function useChatRooms(userId?: string) {
  return useQuery({
    queryKey: ['/api/messages/chat-rooms', userId],
    queryFn: async (): Promise<{ chatRooms: ChatRoom[] }> => {
      if (!userId) throw new Error('userId gerekli')
      
      const response = await fetch(`/api/messages/chat-rooms/${userId}`)
      if (!response.ok) throw new Error('Chat odaları getirilemedi')
      return response.json()
    },
    enabled: !!userId,
  })
}

// Chat odasının mesajlarını getir
export function useChatMessages(chatRoomId?: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['/api/messages/chat-room', chatRoomId, limit, offset],
    queryFn: async (): Promise<{ messages: Message[] }> => {
      if (!chatRoomId) throw new Error('chatRoomId gerekli')
      
      const response = await fetch(
        `/api/messages/chat-room/${chatRoomId}?limit=${limit}&offset=${offset}`
      )
      if (!response.ok) throw new Error('Mesajlar getirilemedi')
      return response.json()
    },
    enabled: !!chatRoomId,
  })
}

// Okunmamış mesaj sayısını getir
export function useUnreadMessageCount(userId?: string) {
  return useQuery({
    queryKey: ['/api/messages/unread-total', userId],
    queryFn: async (): Promise<{ count: number }> => {
      if (!userId) throw new Error('userId gerekli')
      
      const response = await fetch(`/api/messages/unread-total/${userId}`)
      if (!response.ok) throw new Error('Okunmamış mesaj sayısı getirilemedi')
      return response.json()
    },
    enabled: !!userId,
    refetchInterval: 30000, // 30 saniyede bir güncelle
  })
}

// Mesaj gönder
export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      chatRoomId: string
      senderId: string
      receiverId: string
      content: string
      type?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
    }) => {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Mesaj gönderilemedi')
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Mesajları yenile
      queryClient.invalidateQueries({
        queryKey: ['/api/messages/chat-room', variables.chatRoomId]
      })
      
      // Chat odalarını yenile
      queryClient.invalidateQueries({
        queryKey: ['/api/messages/chat-rooms']
      })
      
      // Okunmamış mesaj sayısını yenile
      queryClient.invalidateQueries({
        queryKey: ['/api/messages/unread-total']
      })
    },
  })
}

// Mesajları okundu olarak işaretle
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      messageIds: string[]
      userId: string
    }) => {
      const response = await fetch('/api/messages/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Mesajlar güncellenemedi')
      return response.json()
    },
    onSuccess: () => {
      // Tüm mesaj sorgularını yenile
      queryClient.invalidateQueries({
        queryKey: ['/api/messages']
      })
    },
  })
}

// Sipariş için chat odası oluştur/getir
export function useCreateChatRoom() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      orderId: string
      buyerId: string
      sellerId: string
    }) => {
      const response = await fetch(`/api/messages/chat-room/order/${data.orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: data.buyerId,
          sellerId: data.sellerId
        }),
      })
      
      if (!response.ok) throw new Error('Chat odası oluşturulamadı')
      return response.json()
    },
    onSuccess: () => {
      // Chat odalarını yenile
      queryClient.invalidateQueries({
        queryKey: ['/api/messages/chat-rooms']
      })
    },
  })
}