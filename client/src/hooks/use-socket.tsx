import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrder: (orderId: string) => void;
  leaveOrder: (orderId: string) => void;
  sendMessage: (orderId: string, content: string) => void;
  markMessageAsRead: (messageId: string, orderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(window.location.origin, {
        auth: {
          token: token,
        },
      });

      newSocket.on("connect", () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        
        // Join user's personal room
        newSocket.emit("join_user", user.id);
      });

      newSocket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const joinOrder = (orderId: string) => {
    if (socket) {
      socket.emit("join_order", orderId);
    }
  };

  const leaveOrder = (orderId: string) => {
    if (socket) {
      socket.emit("leave_order", orderId);
    }
  };

  const sendMessage = (orderId: string, content: string) => {
    if (socket) {
      socket.emit("send_message", { orderId, content });
    }
  };

  const markMessageAsRead = (messageId: string, orderId: string) => {
    if (socket) {
      socket.emit("message_read", { messageId, orderId });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinOrder,
      leaveOrder,
      sendMessage,
      markMessageAsRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}