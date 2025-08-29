import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TicketList from "@/components/ticket-list";
import CreateTicketForm from "@/components/create-ticket-form";
import TicketDetailModal from "@/components/ticket-detail-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Plus } from "lucide-react";

export default function TicketsPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tickets");

  // Mock user data - in real app this would come from auth
  const { data: user } = useQuery<any>({
    queryKey: ['/api/me'],
  });

  // Connect to WebSocket for real-time updates
  useWebSocket(user?.id);

  const isAdmin = user?.isAdmin === 'true';

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleCloseModal = () => {
    setSelectedTicketId(null);
  };

  const handleCreateSuccess = () => {
    setActiveTab("tickets");
  };

  return (
    <div className="max-w-7xl mx-auto" data-testid="tickets-page">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="tickets" className="flex items-center gap-2" data-testid="tab-tickets">
            <Ticket size={16} />
            Destek Talepleri
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2" data-testid="tab-create">
            <Plus size={16} />
            Yeni Talep Oluştur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <TicketList
            onTicketSelect={handleTicketSelect}
            onCreateTicket={() => setActiveTab("create")}
          />
        </TabsContent>

        <TabsContent value="create">
          <CreateTicketForm
            onCancel={() => setActiveTab("tickets")}
            onSuccess={handleCreateSuccess}
          />
        </TabsContent>
      </Tabs>

      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={!!selectedTicketId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
