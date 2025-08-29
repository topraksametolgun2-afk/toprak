import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import AdminPanel from "@/components/admin-panel";
import TicketDetailModal from "@/components/ticket-detail-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState } from "react";

export default function AdminPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Mock user data - in real app this would come from auth
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ['/api/me'],
  });

  // Connect to WebSocket for real-time updates
  useWebSocket(user?.id);

  const isAdmin = user?.isAdmin === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Redirect to="/" replace />;
  }

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleCloseModal = () => {
    setSelectedTicketId(null);
  };

  return (
    <div className="max-w-7xl mx-auto" data-testid="admin-page">
      <AdminPanel onTicketSelect={handleTicketSelect} />

      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={!!selectedTicketId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
