import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Ticket, Message } from "@shared/schema";
import { X, User, Shield, NotebookPen, Paperclip, Calendar, Clock, AlertTriangle, Info, Lightbulb, FileImage } from "lucide-react";

interface TicketDetailModalProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticketId, isOpen, onClose }: TicketDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ['/api/tickets', ticketId],
    enabled: !!ticketId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/tickets', ticketId, 'messages'],
    enabled: !!ticketId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/tickets/${ticketId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticketId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setMessageContent("");
      toast({
        title: "Başarılı",
        description: "Mesaj gönderildi!",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent.trim());
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      answered: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
      closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    };

    const statusLabels = {
      open: "Açık",
      answered: "Yanıtlandı",
      closed: "Kapalı"
    };

    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };

    const priorityLabels = {
      urgent: "Acil",
      high: "Yüksek", 
      medium: "Orta",
      low: "Düşük"
    };

    return (
      <Badge className={priorityClasses[priority as keyof typeof priorityClasses]}>
        {priorityLabels[priority as keyof typeof priorityLabels]}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      technical: "Teknik Sorun",
      billing: "Faturalama",
      account: "Hesap Sorunları", 
      feature: "Özellik Talebi",
      other: "Diğer"
    };
    return labels[category as keyof typeof labels] || "Diğer";
  };

  const formatMessageTime = (date: string | Date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !ticketId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0" data-testid="ticket-detail-modal">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div>
            {ticketLoading ? (
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-foreground" data-testid="modal-title">
                  Talep Detayı: #{ticket?.id?.slice(-3) || 'N/A'}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="modal-subtitle">
                  {ticket?.userId?.slice(-8) || 'N/A'} - {new Date(ticket?.createdAt || new Date()).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-modal">
            <X size={20} />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-[600px]">
          {/* Ticket Info Sidebar */}
          <div className="lg:w-1/3 border-r border-border p-6 bg-muted/30">
            {ticketLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Konu</h4>
                  <p className="text-sm text-muted-foreground" data-testid="ticket-subject">
                    {ticket?.subject || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Durum</h4>
                  {getStatusBadge(ticket?.status || 'open')}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Öncelik</h4>
                  {getPriorityBadge(ticket?.priority || 'medium')}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Kategori</h4>
                  <p className="text-sm text-muted-foreground" data-testid="ticket-category">
                    {getCategoryLabel(ticket?.category || 'other')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Açıklama</h4>
                  <p className="text-sm text-muted-foreground" data-testid="ticket-description">
                    {ticket?.description || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Ekler</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileImage size={16} />
                      <span>Henüz dosya eklenmemiş</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground" data-testid="no-messages">
                    Henüz mesaj bulunmuyor. İlk mesajı gönderin!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: Message) => {
                    const isAdmin = message.isAdmin === 'true';
                    return (
                      <div 
                        key={message.id} 
                        className={`flex items-start space-x-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                        data-testid={`message-${message.id}`}
                      >
                        {isAdmin ? (
                          <Shield className="text-2xl text-primary mt-1" size={32} />
                        ) : (
                          <User className="text-2xl text-muted-foreground mt-1" size={32} />
                        )}
                        <div className={`flex-1 ${isAdmin ? 'text-right' : ''}`}>
                          <div className={`flex items-center space-x-2 mb-1 ${isAdmin ? 'justify-end' : ''}`}>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.createdAt || new Date())}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {isAdmin ? "Destek Ekibi" : "Kullanıcı"}
                            </span>
                          </div>
                          <div className={`px-4 py-2 rounded-lg max-w-md ${
                            isAdmin 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <p className="text-sm" data-testid={`message-content-${message.id}`}>
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-3" data-testid="message-form">
                <div className="flex-1">
                  <Textarea 
                    rows={2} 
                    placeholder="Mesajınızı yazın..." 
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="resize-none"
                    data-testid="textarea-message"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button type="button" variant="ghost" size="icon" data-testid="button-attach">
                    <Paperclip size={16} />
                  </Button>
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={sendMessageMutation.isPending || !messageContent.trim()}
                    data-testid="button-send-message"
                  >
                    <NotebookPen size={16} />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
