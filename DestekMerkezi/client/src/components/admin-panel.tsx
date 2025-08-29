import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Ticket } from "@shared/schema";
import { User, Eye, Edit, Filter } from "lucide-react";

interface AdminPanelProps {
  onTicketSelect: (ticketId: string) => void;
}

export default function AdminPanel({ onTicketSelect }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: stats = { open: 0, answered: 0, closed: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: tickets = [], isLoading: ticketsLoading, error } = useQuery({
    queryKey: ['/api/tickets'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/tickets/${ticketId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Başarılı",
        description: "Talep durumu güncellendi!",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum güncellenemedi.",
        variant: "destructive",
      });
    },
  });

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

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateStatusMutation.mutate({ ticketId, status: newStatus });
  };

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive" data-testid="error-message">
            Admin verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Admin Paneli</h2>
            <p className="text-sm text-muted-foreground mt-1">Tüm destek talepleri</p>
          </div>
          {statsLoading ? (
            <div className="flex gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-8 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600" data-testid="stats-open">
                  {stats?.open || 0}
                </div>
                <div className="text-muted-foreground">Açık</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600" data-testid="stats-answered">
                  {stats?.answered || 0}
                </div>
                <div className="text-muted-foreground">Yanıtlandı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="stats-closed">
                  {stats?.closed || 0}
                </div>
                <div className="text-muted-foreground">Kapalı</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Admin Filter Bar */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input 
              type="text" 
              placeholder="Kullanıcı, konu veya ID ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-admin-search"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-admin-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="answered">Yanıtlandı</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger data-testid="select-admin-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" data-testid="button-filter">
              <Filter size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Tickets Table */}
      {ticketsLoading ? (
        <div className="p-6">
          <Skeleton className="h-10 w-full mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full mb-2" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Konu</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredTickets || filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" data-testid="no-tickets">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                      ? "Arama kriterlerinize uygun talep bulunamadı." 
                      : "Henüz talep bulunmuyor."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket: Ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/30" data-testid={`admin-ticket-${ticket.id}`}>
                    <TableCell className="font-medium" data-testid={`ticket-id-${ticket.id}`}>
                      #{ticket.id.slice(-3)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User size={16} className="text-muted-foreground mr-2" />
                        <span className="text-sm text-foreground" data-testid={`ticket-user-${ticket.id}`}>
                          {ticket.userId.slice(-8)} {/* Show last 8 chars of user ID */}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div data-testid={`admin-ticket-subject-${ticket.id}`}>
                        <div className="text-sm text-foreground font-medium truncate max-w-xs">
                          {ticket.subject}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {ticket.description.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={ticket.status || 'open'} 
                        onValueChange={(value) => handleStatusChange(ticket.id, value)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-auto" data-testid={`select-status-${ticket.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Açık</SelectItem>
                          <SelectItem value="answered">Yanıtlandı</SelectItem>
                          <SelectItem value="closed">Kapalı</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell data-testid={`ticket-priority-${ticket.id}`}>
                      {getPriorityBadge(ticket.priority || 'medium')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" data-testid={`ticket-date-${ticket.id}`}>
                      {new Date(ticket.createdAt || new Date()).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onTicketSelect(ticket.id)}
                          data-testid={`button-view-${ticket.id}`}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-edit-${ticket.id}`}
                        >
                          <Edit size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
