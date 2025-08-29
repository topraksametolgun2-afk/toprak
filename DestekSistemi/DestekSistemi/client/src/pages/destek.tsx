import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTicketModal } from "@/components/support/create-ticket-modal";
import { TicketChatModal } from "@/components/support/ticket-chat-modal";
import { Plus, Clock, CheckCircle, Ticket as TicketIcon, Timer, Filter } from "lucide-react";
import type { Ticket } from "@shared/schema";

export default function Destek() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/support/tickets"],
  });

  const openTickets = tickets.filter((t: Ticket) => t.status === "OPEN").length;
  const closedTickets = tickets.filter((t: Ticket) => t.status === "CLOSED").length;
  const totalTickets = tickets.length;

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesSearch = !searchTerm || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === "OPEN") {
      return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800";
    }
    return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800";
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} dakika önce`;
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
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
                <h1 className="text-2xl font-bold">Destek Merkezi</h1>
                <p className="text-muted-foreground">Teknik destek taleplerinizi buradan yönetebilirsiniz</p>
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-create-ticket"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Talep Oluştur
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Açık Talepler</p>
                      <p className="text-2xl font-bold text-amber-600" data-testid="text-open-tickets">{openTickets}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Kapalı Talepler</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="text-closed-tickets">{closedTickets}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Talepler</p>
                      <p className="text-2xl font-bold text-blue-600" data-testid="text-total-tickets">{totalTickets}</p>
                    </div>
                    <TicketIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ortalama Yanıt</p>
                      <p className="text-2xl font-bold text-purple-600" data-testid="text-avg-response">2.5s</p>
                    </div>
                    <Timer className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Talep ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-tickets"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Tüm Durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tüm Durumlar</SelectItem>
                      <SelectItem value="OPEN">Açık</SelectItem>
                      <SelectItem value="CLOSED">Kapalı</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="secondary">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrele
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ticket List */}
            <Card>
              <CardHeader>
                <CardTitle>Destek Taleplerim</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Yükleniyor...</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm || statusFilter ? "Filtrelere uygun talep bulunamadı." : "Henüz hiç destek talebiniz yok."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4 font-medium">Talep ID</th>
                          <th className="text-left p-4 font-medium">Konu</th>
                          <th className="text-left p-4 font-medium">Durum</th>
                          <th className="text-left p-4 font-medium">Oluşturulma</th>
                          <th className="text-left p-4 font-medium">Son Güncelleme</th>
                          <th className="text-left p-4 font-medium">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket: Ticket) => (
                          <tr key={ticket.id} className="border-b border-border hover:bg-accent/50" data-testid={`row-ticket-${ticket.id}`}>
                            <td className="p-4">
                              <span className="font-mono text-sm" data-testid={`text-ticket-id-${ticket.id}`}>
                                #{ticket.id.slice(-8)}
                              </span>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium" data-testid={`text-ticket-subject-${ticket.id}`}>{ticket.subject}</p>
                                <p className="text-sm text-muted-foreground" data-testid={`text-ticket-body-${ticket.id}`}>
                                  {ticket.body.length > 50 ? `${ticket.body.substring(0, 50)}...` : ticket.body}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={getStatusBadge(ticket.status)} data-testid={`status-ticket-${ticket.id}`}>
                                {ticket.status === "OPEN" ? "Açık" : "Kapalı"}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground" data-testid={`text-created-${ticket.id}`}>
                              {formatDate(ticket.createdAt)}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground" data-testid={`text-updated-${ticket.id}`}>
                              {formatDate(ticket.updatedAt)}
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                                className="text-primary hover:text-primary/80"
                                data-testid={`button-view-ticket-${ticket.id}`}
                              >
                                Görüntüle
                              </Button>
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

      <CreateTicketModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {selectedTicket && (
        <TicketChatModal
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
