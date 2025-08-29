import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send } from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

interface TicketData {
  ticket: {
    id: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
  replies: Array<{
    id: string;
    message: string;
    isAdminReply: string;
    createdAt: string;
    userId: string;
  }>;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = authService.getUser();

  const { data, isLoading } = useQuery<TicketData>({
    queryKey: ['/api/support/tickets', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch ticket');
      return response.json();
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', `/api/support/tickets/${ticketId}/reply`, {
        message
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yanıtınız gönderildi.",
      });
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast({
        title: "Hata",
        description: "Yanıt mesajı boş olamaz.",
        variant: "destructive",
      });
      return;
    }
    replyMutation.mutate(replyMessage);
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge 
        className={status === "açık" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                  status === "yanıtlandı" ? "bg-amber-100 text-amber-800 border-amber-200" :
                  status === "kapalı" ? "bg-green-100 text-green-800 border-green-200" :
                  "bg-red-100 text-red-800 border-red-200"}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "acil": return "text-red-600";
      case "yüksek": return "text-orange-600";
      case "orta": return "text-blue-600";
      case "düşük": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getCategoryName = (category?: string) => {
    const names = {
      "technical": "Teknik Sorun",
      "billing": "Faturalandırma", 
      "account": "Hesap Sorunu",
      "feature": "Özellik Talebi",
      "other": "Diğer"
    } as const;
    return names[category as keyof typeof names] || category || "Kategorisiz";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Talep bulunamadı.</p>
          <Button onClick={onBack} className="mt-4">
            Geri Dön
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { ticket, replies } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Talep Detayı</h2>
            <p className="text-muted-foreground">Talep #{ticket.id.slice(-6)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(ticket.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Ticket */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {currentUser?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-foreground">
                      {currentUser?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {ticket.subject}
                  </h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          {replies.map((reply) => (
            <Card key={reply.id} className={reply.isAdminReply === "true" ? "bg-muted/30" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {reply.isAdminReply === "true" ? "A" : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {reply.isAdminReply === "true" ? "Destek Ekibi" : currentUser?.username}
                      </span>
                      {reply.isAdminReply === "true" && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Reply Form */}
          {ticket.status !== "kapalı" && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Yanıt Gönder</h4>
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <Textarea
                    placeholder="Yanıtınızı yazın..."
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="resize-none"
                    data-testid="textarea-reply"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={replyMutation.isPending}
                      data-testid="button-send-reply"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {replyMutation.isPending ? "Gönderiliyor..." : "Yanıt Gönder"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ticket Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-4">Talep Bilgileri</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durum:</span>
                  {getStatusBadge(ticket.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Öncelik:</span>
                  <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span className="text-foreground">{getCategoryName(ticket.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oluşturulma:</span>
                  <span className="text-foreground">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Son Güncelleme:</span>
                  <span className="text-foreground">{formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-4">Müşteri Bilgileri</h4>
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {currentUser?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{currentUser?.username}</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Üye: Ocak 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
