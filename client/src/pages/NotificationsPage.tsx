import { useState } from 'react'
import { Bell, Check, CheckCheck, Mail, Package, ShoppingCart, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotificationsWithActions } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  company?: string
}

interface NotificationPageProps {
  user: User
}

interface Notification {
  id: string
  userId: string
  type: 'ORDER_PLACED' | 'ORDER_APPROVED' | 'ORDER_REJECTED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'GENERAL'
  title: string
  message: string
  orderId?: string
  productId?: string
  isRead: boolean
  isEmailSent: boolean
  createdAt: string
}

export function NotificationsPage({ user }: NotificationPageProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
    refetch
  } = useNotificationsWithActions(user.id)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      case 'ORDER_APPROVED':
        return <CheckCheck className="h-5 w-5 text-green-500" />
      case 'ORDER_REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'ORDER_SHIPPED':
        return <Package className="h-5 w-5 text-orange-500" />
      case 'ORDER_DELIVERED':
        return <Check className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return 'default'
      case 'ORDER_APPROVED':
        return 'success'
      case 'ORDER_REJECTED':
        return 'destructive'
      case 'ORDER_SHIPPED':
        return 'warning'
      case 'ORDER_DELIVERED':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'ORDER_PLACED': 'Sipariş Alındı',
      'ORDER_APPROVED': 'Sipariş Onaylandı',
      'ORDER_REJECTED': 'Sipariş Reddedildi',
      'ORDER_SHIPPED': 'Kargoya Verildi',
      'ORDER_DELIVERED': 'Teslim Edildi',
      'GENERAL': 'Genel'
    }
    return labels[type as keyof typeof labels] || type
  }

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'unread') {
      return !notification.isRead
    }
    return true
  })

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead({ notificationId, userId: user.id })
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead(user.id)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bildirimler</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Bildirimler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="notifications-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" data-testid="unread-count">
              {unreadCount} okunmamış
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              variant="outline"
              size="sm"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {isMarkingAllAsRead ? 'İşaretleniyor...' : 'Hepsini Okundu Yap'}
            </Button>
          )}
          
          <Button
            onClick={refetch}
            disabled={isLoading}
            variant="outline"
            size="sm"
            data-testid="button-refresh"
          >
            <Bell className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="filter-all"
        >
          Tümü ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="filter-unread"
        >
          Okunmamış ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'Tüm bildirimleriniz okunmuş durumda.'
                  : 'Yeni bildirimler burada görünecek.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification: Notification) => (
            <Card 
              key={notification.id}
              className={`transition-all ${
                !notification.isRead 
                  ? 'border-blue-200 bg-blue-50/50' 
                  : 'hover:bg-gray-50/50'
              }`}
              data-testid={`notification-${notification.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <Badge 
                        variant={getNotificationBadgeVariant(notification.type)}
                        className="text-xs"
                      >
                        {getTypeLabel(notification.type)}
                      </Badge>
                      {notification.isEmailSent && (
                        <Mail className="h-3 w-3 text-gray-400" title="Email gönderildi" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </p>
                      
                      {!notification.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isMarkingAsRead}
                          size="sm"
                          variant="outline"
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Okundu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}