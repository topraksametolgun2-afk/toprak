import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api'

// Bildirimleri getir
export function useNotifications(userId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['notifications', userId, limit],
    queryFn: async () => {
      if (!userId) return { notifications: [] }
      
      const response = await fetch(`${API_BASE}/notifications?userId=${userId}&limit=${limit}`)
      if (!response.ok) throw new Error('Bildirimler getirilemedi')
      return response.json()
    },
    enabled: !!userId,
  })
}

// Okunmamış bildirim sayısını getir
export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: async () => {
      if (!userId) return { count: 0 }
      
      const response = await fetch(`${API_BASE}/notifications/unread-count?userId=${userId}`)
      if (!response.ok) throw new Error('Okunmamış sayı getirilemedi')
      return response.json()
    },
    enabled: !!userId,
    refetchInterval: 30000, // 30 saniyede bir güncelle
  })
}

// Bildirimi okundu olarak işaretle
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ notificationId, userId }: { notificationId: string, userId: string }) => {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      
      if (!response.ok) throw new Error('Bildirim güncellenemedi')
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['notifications', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', variables.userId] })
    },
  })
}

// Tüm bildirimleri okundu olarak işaretle
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      
      if (!response.ok) throw new Error('Bildirimler güncellenemedi')
      return response.json()
    },
    onSuccess: (_, userId) => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', userId] })
    },
  })
}

// Bildirimler hook'u (birleşik)
export function useNotificationsWithActions(userId: string | undefined) {
  const notificationsQuery = useNotifications(userId)
  const unreadCountQuery = useUnreadCount(userId)
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  
  return {
    notifications: notificationsQuery.data?.notifications || [],
    unreadCount: unreadCountQuery.data?.count || 0,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    error: notificationsQuery.error || unreadCountQuery.error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    refetch: () => {
      notificationsQuery.refetch()
      unreadCountQuery.refetch()
    }
  }
}