import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, AlertTriangle, Info, Lightbulb, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Ticket } from "@shared/schema";
import { useState } from "react";

interface TicketListProps {
  onTicketSelect: (ticketId: string) => void;
  onCreateTicket: () => void;
}

export default function TicketList({ onTicketSelect, onCreateTicket }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['/api/tickets'],
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle size={12} className="mr-1" />;
      case 'medium':
        return <Info size={12} className="mr-1" />;
      case 'low':
        return <Lightbulb size={12} className="mr-1" />;
      default:
        return <Info size={12} className="mr-1" />;
    }
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
      <Badge className={statusClasses[status as keyof typeof statusClasses]} data-testid={`status-${status}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Az önce";
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    return `${Math.floor(diffInHours / 24)} gün önce`;
  };

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive" data-testid="error-message">
            Tickets yüklenemedi. Lütfen daha sonra tekrar deneyin.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Destek Taleplerim</h2>
        <p className="text-sm text-muted-foreground mt-1">Açtığınız destek talepleri ve durumları</p>
      </div>
      
      {/* Filter Bar */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              type="text" 
              placeholder="Talep ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto" data-testid="select-status-filter">
              <SelectValue placeholder="Durum seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="open">Açık</SelectItem>
              <SelectItem value="answered">Yanıtlandı</SelectItem>
              <SelectItem value="closed">Kapalı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="px-6 py-12 text-center" data-testid="empty-tickets">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm || statusFilter !== "all" ? "Arama kriterlerinize uygun talep bulunamadı" : "Henüz destek talebi yok"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Farklı kriterlerle arama yapmayı deneyin." : "İlk destek talebinizi oluşturmak için aşağıdaki butona tıklayın."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={onCreateTicket} data-testid="button-create-ticket">
              Yeni Talep Oluştur
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredTickets.map((ticket: Ticket) => (
            <div 
              key={ticket.id} 
              className="px-6 py-4 hover:bg-muted/50 cursor-pointer" 
              onClick={() => onTicketSelect(ticket.id)}
              data-testid={`ticket-${ticket.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-medium text-foreground truncate" data-testid={`ticket-subject-${ticket.id}`}>
                      {ticket.subject}
                    </h3>
                    {getStatusBadge(ticket.status || 'open')}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`ticket-description-${ticket.id}`}>
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span data-testid={`ticket-date-${ticket.id}`}>
                      <Calendar size={12} className="mr-1 inline" />
                      {formatDate(ticket.createdAt || new Date())}
                    </span>
                    <span data-testid={`ticket-updated-${ticket.id}`}>
                      <Clock size={12} className="mr-1 inline" />
                      Son güncelleme: {getTimeAgo(ticket.updatedAt || ticket.createdAt || new Date())}
                    </span>
                    <span data-testid={`ticket-priority-${ticket.id}`}>
                      {getPriorityIcon(ticket.priority || 'medium')}
                      {ticket.priority === 'urgent' ? 'Acil' : 
                       ticket.priority === 'high' ? 'Yüksek' :
                       ticket.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <ChevronRight className="text-muted-foreground" size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
