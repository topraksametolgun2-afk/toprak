import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Package, User, Calendar, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
}

interface Order {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  buyerId: string;
  supplierId: string;
  notes?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [, params] = useRoute("/messages/:orderId");
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { socket, joinOrder, leaveOrder, markMessageAsRead } = useSocket();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orderId = params?.orderId;

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", orderId],
    enabled: !!orderId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      return fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          orderId,
          content,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", orderId] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    },
  });

  // Join order room on mount and leave on unmount
  useEffect(() => {
    if (orderId) {
      joinOrder(orderId);
      return () => leaveOrder(orderId);
    }
  }, [orderId, joinOrder, leaveOrder]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: Message & { senderName: string }) => {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", orderId] });
        
        if (message.senderId !== user?.id) {
          toast({
            title: "Yeni Mesaj",
            description: `${message.senderName}: ${message.content}`,
          });
        }
      };

      const handleMessageStatusUpdate = (data: { messageId: string; status: string }) => {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", orderId] });
      };

      socket.on("new_message", handleNewMessage);
      socket.on("message_status_update", handleMessageStatusUpdate);

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("message_status_update", handleMessageStatusUpdate);
      };
    }
  }, [socket, orderId, user?.id, toast]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "confirmed":
        return "Onaylandı";
      case "in_progress":
        return "İşlemde";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  if (orderLoading || messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const order: Order = orderData?.order;
  const messages: Message[] = messagesData?.messages || [];

  if (!order) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sipariş bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Bu sipariş mevcut değil veya erişim yetkiniz yok.
          </p>
          <Link href="/orders">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Siparişlere Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isUserBuyer = order.buyerId === user?.id;
  const otherPartyId = isUserBuyer ? order.supplierId : order.buyerId;

  return (
    <div className="flex-1 flex flex-col" data-testid="messages-page">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/orders">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Siparişlere Dön
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h1 className="text-xl font-semibold" data-testid="text-product-name">
                    {order.productName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isUserBuyer ? "Tedarikçi" : "Müşteri"}: {otherPartyId}
                  </p>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(order.status)} data-testid="order-status">
              {getStatusText(order.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Order Details Sidebar */}
        <div className="w-80 border-r bg-muted/10">
          <div className="p-6">
            <h2 className="font-semibold mb-4">Sipariş Detayları</h2>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{order.productName}</CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(order.createdAt), "dd MMMM yyyy", { locale: tr })}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Miktar</p>
                    <p className="font-medium" data-testid="text-quantity">
                      {order.quantity} adet
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Toplam</p>
                    <p className="font-medium" data-testid="text-total-price">
                      {order.totalPrice.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Rol</p>
                  <p className="font-medium text-sm">
                    {isUserBuyer ? "Alıcı" : "Tedarikçi"}
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-muted-foreground text-sm">Notlar</p>
                    <p className="text-sm" data-testid="text-notes">
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz mesaj yok</h3>
                  <p className="text-muted-foreground">
                    Bu sipariş hakkında konuşmaya başlayın.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 max-w-[80%]",
                        isOwnMessage ? "ml-auto flex-row-reverse" : ""
                      )}
                      data-testid={`message-${message.id}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {isOwnMessage ? "S" : "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p data-testid={`text-message-content-${message.id}`}>
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-xs opacity-70">
                            {format(new Date(message.createdAt), "HH:mm", { locale: tr })}
                          </p>
                          {isOwnMessage && (
                            <div className="text-xs opacity-70">
                              {message.status === "read" ? "Okundu" : "İletildi"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}