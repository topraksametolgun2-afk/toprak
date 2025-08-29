import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, MessageCircle, User, Clock, ArrowLeft } from 'lucide-react'
import { ChatRoom } from '@/components/chat/ChatRoom'
import { useChatRooms, useUnreadMessageCount } from '@/hooks/useMessages'
import { useWebSocket } from '@/hooks/useWebSocket'
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

interface MessagesPageProps {
  user: User
}

export function MessagesPage({ user }: MessagesPageProps) {
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null)
  const { data: chatRoomsData, isLoading, refetch } = useChatRooms(user.id)
  const { data: unreadData } = useUnreadMessageCount(user.id)
  
  const chatRooms = chatRoomsData?.chatRooms || []
  const totalUnread = unreadData?.count || 0

  // WebSocket ile yeni mesaj bildirimi al
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_message') {
      // Chat odalarını yenile
      refetch()
    }
  }, [refetch])

  const { isConnected, sendMessage } = useWebSocket({
    userId: user.id,
    onMessage: handleWebSocketMessage
  })

  const selectedRoom = selectedChatRoom 
    ? chatRooms.find(room => room.id === selectedChatRoom)
    : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="messages-page">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Mesajlar</h1>
          {totalUnread > 0 && (
            <Badge variant="destructive">{totalUnread}</Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}</span>
        </div>
      </div>

      {/* Ana İçerik */}
      {chatRooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz mesajınız yok
            </h3>
            <p className="text-gray-600 mb-4">
              Sipariş verdiğinizde veya aldığınızda toptancılarla/alıcılarla mesajlaşabilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Odaları Listesi */}
          <div className={`space-y-3 ${selectedChatRoom ? 'hidden lg:block' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-900">Konuşmalar</h2>
            
            {chatRooms.map((room) => {
              const isSelected = selectedChatRoom === room.id
              const otherUser = room.otherUser
              
              if (!otherUser) return null

              return (
                <Card 
                  key={room.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedChatRoom(room.id)}
                  data-testid={`chat-room-item-${room.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </h3>
                          {room.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(room.lastMessageAt), { 
                                addSuffix: true, 
                                locale: tr 
                              })}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-sm text-gray-600 truncate">
                            {otherUser.company}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{room.orderId.slice(-6)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <Badge 
                            variant={otherUser.role === 'BUYER' ? 'secondary' : 'default'} 
                            className="text-xs mr-2"
                          >
                            {otherUser.role === 'BUYER' ? 'Alıcı' : 'Toptancı'}
                          </Badge>
                          
                          {room.isActive ? (
                            <div className="flex items-center text-green-600 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                              Aktif
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Pasif
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Chat Alanı */}
          <div className={`lg:col-span-2 ${!selectedChatRoom ? 'hidden lg:block' : ''}`}>
            {selectedRoom ? (
              <div className="space-y-4">
                {/* Mobilde Geri Butonu */}
                <div className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChatRoom(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri Dön
                  </Button>
                </div>

                <ChatRoom
                  chatRoomId={selectedRoom.id}
                  currentUserId={user.id}
                  otherUser={selectedRoom.otherUser!}
                  orderId={selectedRoom.orderId}
                  onSendWebSocketMessage={sendMessage}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Konuşma Seçin
                  </h3>
                  <p className="text-gray-600">
                    Sol taraftan bir konuşma seçerek mesajlaşmaya başlayın.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Bağlantı Durumu Uyarısı */}
      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800">
                  Bağlantı Sorunu
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  Gerçek zamanlı mesaj alımı şu anda devre dışı. Yeni mesajları görmek için sayfayı yenilemeniz gerekebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}