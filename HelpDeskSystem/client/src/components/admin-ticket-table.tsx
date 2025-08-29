import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Reply, Edit, X } from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
  userId: string;
}

interface AdminTicketTableProps {
  onClose: () => void;
  onTicketSelect: (ticketId: string) => void;
}

export function AdminTicketTable({ onClose, onTicketSelect }: AdminTicketTableProps) {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    date: ""
  });
  const [replyDialog, setReplyDialog] = useState<{open: boolean, ticketId: string, message: string}>({
    open: false,
    ticketId: "",
    message: ""
  });
  const [statusDialog, setStatusDialog] = useState<{open: boolean, ticketId: string, status: string}>({
    open: false,
    ticketId: "",
    status: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<AdminTicket[]>({
    queryKey: ['/api/support/admin/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/support/admin/tickets', {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string, message: string }) => {
      const response = await apiRequest('POST', `/api/support/admin/tickets/${ticketId}/reply`, {
        message
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yanıt gönderildi.",
      });
      setReplyDialog({ open: false, ticketId: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/support/admin/tickets'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string, status: string }) => {
      const response = await apiRequest('PUT', `/api/support/admin/tickets/${ticketId}/status`, {
        status
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Talep durumu güncellendi.",
      });
      setStatusDialog({ open: false, ticketId: "", status: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/support/admin/tickets'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const filteredTickets = tickets.filter(ticket => {
    return (
      (!filters.status || ticket.status === filters.status) &&
      (!filters.category || ticket.category === filters.category) &&
      (!filters.priority || ticket.priority === filters.priority)
    );
  });

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
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendReply = () => {
    if (!replyDialog.message.trim()) {
      toast({
        title: "Hata",
        description: "Yanıt mesajı boş olamaz.",
        variant: "destructive",
      });
      return;
    }
    replyMutation.mutate({
      ticketId: replyDialog.ticketId,
      message: replyDialog.message
    });
  };

  const handleUpdateStatus = () => {
    statusMutation.mutate({
      ticketId: statusDialog.ticketId,
      status: statusDialog.status
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Admin Panel - Tüm Destek Talepleri</h2>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-admin">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Admin Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Durum</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="açık">Açık</SelectItem>
                  <SelectItem value="yanıtlandı">Yanıtlandı</SelectItem>
                  <SelectItem value="kapalı">Kapalı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Kategori</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger data-testid="select-filter-category">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="technical">Teknik Sorun</SelectItem>
                  <SelectItem value="billing">Faturalandırma</SelectItem>
                  <SelectItem value="account">Hesap Sorunu</SelectItem>
                  <SelectItem value="feature">Özellik Talebi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Öncelik</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger data-testid="select-filter-priority">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="acil">Acil</SelectItem>
                  <SelectItem value="yüksek">Yüksek</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="düşük">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Tarih Aralığı</Label>
              <Input 
                type="date" 
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                data-testid="input-filter-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Talep #</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Müşteri</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Konu</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Öncelik</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Oluşturulma</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Hiç destek talebi bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-primary">#{ticket.id.slice(-6)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">Kullanıcı</p>
                            <p className="text-xs text-muted-foreground">user@example.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">{getCategoryName(ticket.category)}</p>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-foreground">{formatDate(ticket.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(ticket.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTicketSelect(ticket.id)}
                            data-testid={`button-view-${ticket.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Dialog 
                            open={replyDialog.open && replyDialog.ticketId === ticket.id} 
                            onOpenChange={(open) => setReplyDialog(prev => ({ ...prev, open, ticketId: open ? ticket.id : "" }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`button-reply-${ticket.id}`}>
                                <Reply className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Yanıt Gönder</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Müşteriye yanıtınızı yazın..."
                                  rows={4}
                                  value={replyDialog.message}
                                  onChange={(e) => setReplyDialog(prev => ({ ...prev, message: e.target.value }))}
                                  className="resize-none"
                                  data-testid="textarea-admin-reply"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setReplyDialog({ open: false, ticketId: "", message: "" })}
                                  >
                                    İptal
                                  </Button>
                                  <Button 
                                    onClick={handleSendReply} 
                                    disabled={replyMutation.isPending}
                                    data-testid="button-send-admin-reply"
                                  >
                                    {replyMutation.isPending ? "Gönderiliyor..." : "Yanıt Gönder"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog 
                            open={statusDialog.open && statusDialog.ticketId === ticket.id} 
                            onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open, ticketId: open ? ticket.id : "", status: open ? ticket.status : "" }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`button-edit-${ticket.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Durumu Güncelle</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select 
                                  value={statusDialog.status} 
                                  onValueChange={(value) => setStatusDialog(prev => ({ ...prev, status: value }))}
                                >
                                  <SelectTrigger data-testid="select-admin-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="açık">Açık</SelectItem>
                                    <SelectItem value="yanıtlandı">Yanıtlandı</SelectItem>
                                    <SelectItem value="kapalı">Kapalı</SelectItem>
                                    <SelectItem value="beklemede">Beklemede</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setStatusDialog({ open: false, ticketId: "", status: "" })}
                                  >
                                    İptal
                                  </Button>
                                  <Button 
                                    onClick={handleUpdateStatus} 
                                    disabled={statusMutation.isPending}
                                    data-testid="button-update-status"
                                  >
                                    {statusMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Toplam {filteredTickets.length} talepten 1-{Math.min(10, filteredTickets.length)} arası gösteriliyor
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Önceki
          </Button>
          <Button variant="default" size="sm">1</Button>
          <Button variant="outline" size="sm">
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}
