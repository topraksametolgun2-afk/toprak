import { useEffect, useRef, useState } from 'react';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface WSMessage {
  type: 'new_ticket' | 'new_reply' | 'status_update';
  [key: string]: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        const currentUser = authService.getUser();
        
        if (!currentUser) return;

        switch (message.type) {
          case 'new_ticket':
            if (currentUser.role === 'admin') {
              toast({
                title: "Yeni Destek Talebi",
                description: `${message.user.username} tarafından yeni talep: ${message.ticket.subject}`,
              });
            }
            break;
          
          case 'new_reply':
            if (message.userId === currentUser.id) {
              toast({
                title: "Yeni Yanıt",
                description: `Talep #${message.ticketId.slice(-6)} için yeni yanıt var`,
              });
            }
            break;
          
          case 'status_update':
            if (message.userId === currentUser.id) {
              toast({
                title: "Talep Durumu Güncellendi",
                description: `Talebinizin durumu "${message.status}" olarak güncellendi`,
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  return { isConnected };
}
