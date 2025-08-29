import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  userId?: string
  onMessage?: (message: WebSocketMessage) => void
}

export function useWebSocket({ userId, onMessage }: UseWebSocketOptions = {}) {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws`
      
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        
        // Kullanıcı kaydı
        if (userId) {
          ws.current?.send(JSON.stringify({
            type: 'register',
            userId
          }))
        }
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('WebSocket mesaj parse hatası:', error)
        }
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        setError('Bağlantı kesildi')
        
        // Otomatik yeniden bağlanma (5 saniye sonra)
        setTimeout(() => {
          if (userId) {
            connect()
          }
        }, 5000)
      }

      ws.current.onerror = () => {
        setError('WebSocket bağlantı hatası')
      }
    } catch (error) {
      setError('WebSocket oluşturulamadı')
    }
  }, [userId, onMessage])

  const disconnect = useCallback(() => {
    ws.current?.close()
    ws.current = null
    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [userId, connect, disconnect])

  return {
    isConnected,
    error,
    sendMessage,
    connect,
    disconnect
  }
}