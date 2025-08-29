import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  senderId: string
  createdAt: string
  isRead: boolean
}

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  senderName?: string
  showSenderName?: boolean
}

export function MessageBubble({ message, isOwnMessage, senderName, showSenderName }: MessageBubbleProps) {
  const isSystemMessage = message.type === 'SYSTEM'
  
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4" data-testid={`message-system-${message.id}`}>
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-lg max-w-md text-center">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "flex mb-4",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${message.id}`}
    >
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative",
          isOwnMessage
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        )}
      >
        {showSenderName && !isOwnMessage && senderName && (
          <div className="text-xs text-gray-500 mb-1 font-medium">
            {senderName}
          </div>
        )}
        
        <div className="break-words">
          {message.content}
        </div>
        
        <div className="flex items-center justify-end mt-2 space-x-2">
          <span 
            className={cn(
              "text-xs",
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            )}
          >
            {formatDistanceToNow(new Date(message.createdAt), { 
              addSuffix: true, 
              locale: tr 
            })}
          </span>
          
          {isOwnMessage && (
            <div className="flex space-x-1">
              {message.isRead ? (
                <div className="flex">
                  <div className="w-3 h-3 text-blue-100">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                    </svg>
                  </div>
                  <div className="w-3 h-3 text-blue-100 -ml-1">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-3 h-3 text-blue-200">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}