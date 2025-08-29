import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Tag, ChevronRight, X } from "lucide-react";
import { authService } from "@/lib/auth";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "açık" | "yanıtlandı" | "kapalı" | "beklemede";
  priority: "düşük" | "orta" | "yüksek" | "acil";
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketListProps {
  onClose: () => void;
  onTicketSelect: (ticketId: string) => void;
}

export function TicketList({ onClose, onTicketSelect }: TicketListProps) {
  const [filter, setFilter] = useState<"all" | "açık" | "yanıtlandı" | "kapalı">("all");

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/support/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/support/tickets', {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    }
  });

  const filteredTickets = tickets.filter(ticket => 
    filter === "all" || ticket.status === filter
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      "açık": "default",
      "yanıtlandı": "secondary", 
      "kapalı": "outline",
      "beklemede": "destructive"
    } as const;
    
    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "default"} 
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
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilterCounts = () => {
    return {
      all: tickets.length,
      açık: tickets.filter(t => t.status === "açık").length,
      yanıtlandı: tickets.filter(t => t.status === "yanıtlandı").length,
      kapalı: tickets.filter(t => t.status === "kapalı").length
    };
  };

  const counts = getFilterCounts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Taleplerim</h2>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-list">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "all", label: `Tümü (${counts.all})` },
            { key: "açık", label: `Açık (${counts.açık})` },
            { key: "yanıtlandı", label: `Yanıtlandı (${counts.yanıtlandı})` },
            { key: "kapalı", label: `Kapalı (${counts.kapalı})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                filter === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
              data-testid={`filter-${key}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {filter === "all" 
                  ? "Henüz hiç destek talebiniz bulunmuyor." 
                  : `"${filter}" durumunda hiç talep bulunmuyor.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTicketSelect(ticket.id)}
              data-testid={`ticket-${ticket.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{ticket.id.slice(-6)}
                      </span>
                      {getStatusBadge(ticket.status)}
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Öncelik
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {ticket.subject}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {ticket.message.length > 100 
                        ? ticket.message.substring(0, 100) + "..." 
                        : ticket.message
                      }
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(ticket.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(ticket.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {getCategoryName(ticket.category)}
                      </span>
                      {ticket.status === "yanıtlandı" && (
                        <span className="text-amber-600 font-medium">
                          Yeni yanıt var
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
