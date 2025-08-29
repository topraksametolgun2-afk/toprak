import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { AdminTicketTable } from "@/components/admin-ticket-table";
import { TicketDetail } from "@/components/ticket-detail";
import { useWebSocket } from "@/hooks/use-websocket";
import { authService } from "@/lib/auth";
import { useLocation } from "wouter";

export default function AdminPanel() {
  const [currentView, setCurrentView] = useState<"table" | "detail">("table");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [, setLocation] = useLocation();
  
  useWebSocket(); // Connect to WebSocket for real-time notifications

  // Check if user is admin
  const user = authService.getUser();
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Erişim Reddedildi</h1>
            <p className="text-muted-foreground">Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView("detail");
  };

  const handleBackToTable = () => {
    setCurrentView("table");
    setSelectedTicketId("");
  };

  const handleClosePanel = () => {
    setLocation("/help-center");
  };

  const renderContent = () => {
    switch (currentView) {
      case "detail":
        return <TicketDetail ticketId={selectedTicketId} onBack={handleBackToTable} />;
      default:
        return <AdminTicketTable onClose={handleClosePanel} onTicketSelect={handleTicketSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}
