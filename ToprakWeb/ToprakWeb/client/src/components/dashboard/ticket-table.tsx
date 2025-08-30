import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Ticket } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TicketTable() {
  const queryClient = useQueryClient();
  
  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      bekliyor: { label: "Bekliyor", variant: "secondary" as const },
      cozuluyor: { label: "Çözülüyor", variant: "default" as const },
      cozuldu: { label: "Çözüldü", variant: "secondary" as const },
      acil: { label: "Acil", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.bekliyor;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("tr-TR");
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm("Bu ticket'ı silmek istediğinizden emin misiniz?")) {
      deleteTicketMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border" data-testid="ticket-table-loading">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Son Ticketlar</h3>
            <Button data-testid="button-new-ticket">
              <Plus className="mr-2 w-4 h-4" />
              Yeni Ticket
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border" data-testid="ticket-table">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Son Ticketlar</h3>
          <Button data-testid="button-new-ticket">
            <Plus className="mr-2 w-4 h-4" />
            Yeni Ticket
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Konu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {tickets?.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-muted/50" data-testid={`ticket-row-${ticket.id}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  #{ticket.id.slice(-4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {ticket.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  Admin User
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(ticket.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-view-ticket-${ticket.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-edit-ticket-${ticket.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTicket(ticket.id)}
                      disabled={deleteTicketMutation.isPending}
                      data-testid={`button-delete-ticket-${ticket.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Toplam {tickets?.length || 0} kayıt gösteriliyor
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled data-testid="button-previous-page">
              Önceki
            </Button>
            <Button variant="default" size="sm" data-testid="button-page-1">1</Button>
            <Button variant="outline" size="sm" data-testid="button-page-2">2</Button>
            <Button variant="outline" size="sm" data-testid="button-page-3">3</Button>
            <Button variant="outline" size="sm" data-testid="button-next-page">
              Sonraki
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
