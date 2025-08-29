import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageCircle, User, Building } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { useChatMessages, useSendMessage, useMarkMessagesAsRead } from '@/hooks/useMessages'

interface ChatRoomProps {
  chatRoomId: string
  currentUserId: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    email: string
    company?: string
    role: 'BUYER' | 'SELLER' | 'ADMIN'
  }
  orderId: string
  onSendWebSocketMessage?: (message: any) => void
}

export function ChatRoom({ 
  chatRoomId, 
  currentUserId, 
  otherUser, 
  orderId,
  onSendWebSocketMessage 
}: ChatRoomProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: messagesData, isLoading } = useChatMessages(chatRoomId)
  const sendMessage = useSendMessage()
  const markAsRead = useMarkMessagesAsRead()

  const messages = messagesData?.messages || []

  // Otomatik scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Okunmamış mesajları işaretle
  useEffect(() => {
    const unreadMessages = messages
      .filter(msg => msg.receiverId === currentUserId && !msg.isRead)
      .map(msg => msg.id)

    if (unreadMessages.length > 0) {
      markAsRead.mutate({
        messageIds: unreadMessages,
        userId: currentUserId
      })
    }
  }, [messages, currentUserId, markAsRead])

  const handleSendMessage = (content: string) => {
    sendMessage.mutate({
      chatRoomId,
      senderId: currentUserId,
      receiverId: otherUser.id,
      content,
      type: 'TEXT'
    }, {
      onSuccess: () => {
        // WebSocket üzerinden gerçek zamanlı bildirim gönder
        if (onSendWebSocketMessage) {
          onSendWebSocketMessage({
            type: 'message',
            senderId: currentUserId,
            receiverId: otherUser.id,
            chatRoomId,
            content
          })
        }
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Mesajlar yükleniyor...</span>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col" data-testid={`chat-room-${chatRoomId}`}>
      {/* Chat Header */}
      <CardHeader className="border-b bg-gray-50 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            
            <div>
              <CardTitle className="text-lg">
                {otherUser.firstName} {otherUser.lastName}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="h-3 w-3" />
                <span>{otherUser.company}</span>
                <Badge variant="secondary" className="text-xs">
                  {otherUser.role === 'BUYER' ? 'Alıcı' : 'Toptancı'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Sipariş: #{orderId.slice(-6)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <MessageCircle className="h-3 w-3 mr-1" />
              Aktif
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Henüz mesaj yok</p>
            <p className="text-sm">İlk mesajı göndererek konuşmaya başlayın!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
                senderName={
                  message.senderId !== currentUserId 
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : undefined
                }
                showSenderName={false} // Sadece iki kişilik chat olduğu için gerek yok
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sendMessage.isPending}
        placeholder={`${otherUser.firstName}'e mesaj yazın...`}
      />
    </Card>
  )
}