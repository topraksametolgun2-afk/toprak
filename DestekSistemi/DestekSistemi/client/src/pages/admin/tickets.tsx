import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketChatModal } from "@/components/support/ticket-chat-modal";
import type { Ticket } from "@shared/schema";

export default function AdminTickets() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/support/tickets"],
  });

  const openTickets = tickets.filter((t: Ticket) => t.status === "OPEN").length;
  const closedTickets = tickets.filter((t: Ticket) => t.status === "CLOSED").length;
  const urgentTickets = tickets.filter((t: Ticket) => t.priority === "urgent" && t.status === "OPEN").length;
  const highPriorityTickets = tickets.filter((t: Ticket) => t.priority === "high" && t.status === "OPEN").length;
  const resolvedToday = tickets.filter((t: Ticket) => {
    const today = new Date();
    const ticketDate = new Date(t.updatedAt);
    return t.status === "CLOSED" && 
           ticketDate.toDateString() === today.toDateString();
  }).length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800";
      case "high":
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800";
      case "medium":
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800";
      default:
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "OPEN") {
      return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800";
    }
    return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800";
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} dk önce`;
    } else if (diffInMinutes < 1440) {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `${diffInDays} gün önce`;
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Destek Talepleri Yönetimi</h1>
                <p className="text-muted-foreground">Tüm kullanıcı destek taleplerini yönetin</p>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600" data-testid="text-urgent-tickets">{urgentTickets}</p>
                    <p className="text-sm text-muted-foreground">Acil</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600" data-testid="text-open-tickets">{openTickets}</p>
                    <p className="text-sm text-muted-foreground">Açık</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600" data-testid="text-high-priority-tickets">{highPriorityTickets}</p>
                    <p className="text-sm text-muted-foreground">Yüksek Öncelik</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600" data-testid="text-resolved-today">{resolvedToday}</p>
                    <p className="text-sm text-muted-foreground">Bugün Çözülen</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600" data-testid="text-avg-resolution">4.2s</p>
                    <p className="text-sm text-muted-foreground">Ort. Çözüm</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Ticket Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tüm Destek Talepleri</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Yenile</Button>
                  <Button variant="outline" size="sm">Dışa Aktar</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Yükleniyor...</div>
                ) : tickets.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Henüz hiç destek talebi yok.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Kullanıcı</th>
                          <th className="text-left p-3 font-medium">Konu</th>
                          <th className="text-left p-3 font-medium">Durum</th>
                          <th className="text-left p-3 font-medium">Öncelik</th>
                          <th className="text-left p-3 font-medium">Kategori</th>
                          <th className="text-left p-3 font-medium">Son Mesaj</th>
                          <th className="text-left p-3 font-medium">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket: Ticket) => (
                          <tr key={ticket.id} className="border-b border-border hover:bg-accent/50" data-testid={`row-admin-ticket-${ticket.id}`}>
                            <td className="p-3">
                              <span className="font-mono text-xs" data-testid={`text-admin-ticket-id-${ticket.id}`}>
                                #{ticket.id.slice(-8)}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                  U
                                </div>
                                <span className="text-sm" data-testid={`text-admin-ticket-user-${ticket.id}`}>Kullanıcı</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="text-sm font-medium" data-testid={`text-admin-ticket-subject-${ticket.id}`}>{ticket.subject}</p>
                            </td>
                            <td className="p-3">
                              <span className={getStatusBadge(ticket.status)} data-testid={`status-admin-ticket-${ticket.id}`}>
                                {ticket.status === "OPEN" ? "Açık" : "Kapalı"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={getPriorityBadge(ticket.priority)} data-testid={`priority-admin-ticket-${ticket.id}`}>
                                {ticket.priority === "urgent" ? "Acil" : 
                                 ticket.priority === "high" ? "Yüksek" :
                                 ticket.priority === "medium" ? "Orta" : "Düşük"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-muted-foreground" data-testid={`category-admin-ticket-${ticket.id}`}>
                                {ticket.category}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-xs text-muted-foreground" data-testid={`time-admin-ticket-${ticket.id}`}>
                                {formatDate(ticket.updatedAt)}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="text-primary hover:text-primary/80 text-xs"
                                  data-testid={`button-admin-reply-${ticket.id}`}
                                >
                                  Yanıtla
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-500 text-xs"
                                  data-testid={`button-admin-assign-${ticket.id}`}
                                >
                                  Ata
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-500 text-xs"
                                  data-testid={`button-admin-close-${ticket.id}`}
                                >
                                  Kapat
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {selectedTicket && (
        <TicketChatModal
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={() => setSelectedTicket(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
}
