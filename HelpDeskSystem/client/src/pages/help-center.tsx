import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { TicketForm } from "@/components/ticket-form";
import { TicketList } from "@/components/ticket-list";
import { TicketDetail } from "@/components/ticket-detail";
import { useWebSocket } from "@/hooks/use-websocket";
import { authService } from "@/lib/auth";
import { TicketIcon, Clock, MessageCircle, CheckCircle, Plus, List } from "lucide-react";

type View = "dashboard" | "create" | "list" | "detail";

export default function HelpCenter() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  
  useWebSocket(); // Connect to WebSocket for real-time notifications

  const { data: stats } = useQuery({
    queryKey: ['/api/support/tickets/stats'],
    queryFn: async () => {
      const response = await fetch('/api/support/tickets', {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) return { total: 0, pending: 0, replied: 0, closed: 0 };
      const tickets = await response.json();
      
      return {
        total: tickets.length,
        pending: tickets.filter((t: any) => t.status === "açık").length,
        replied: tickets.filter((t: any) => t.status === "yanıtlandı").length,
        closed: tickets.filter((t: any) => t.status === "kapalı").length
      };
    }
  });

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView("detail");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedTicketId("");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedTicketId("");
  };

  const renderContent = () => {
    switch (currentView) {
      case "create":
        return <TicketForm onClose={handleBackToDashboard} />;
      case "list":
        return <TicketList onClose={handleBackToDashboard} onTicketSelect={handleTicketSelect} />;
      case "detail":
        return <TicketDetail ticketId={selectedTicketId} onBack={handleBackToList} />;
      default:
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Yardım Merkezi</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sorularınız için destek talebi oluşturun ve takip edin. Uzman ekibimiz size yardımcı olmak için burada.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TicketIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Toplam Talepler</h3>
                      <p className="text-2xl font-bold text-foreground" data-testid="stats-total">
                        {stats?.total || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Bekleyen</h3>
                      <p className="text-2xl font-bold text-foreground" data-testid="stats-pending">
                        {stats?.pending || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Yanıtlanan</h3>
                      <p className="text-2xl font-bold text-foreground" data-testid="stats-replied">
                        {stats?.replied || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Çözülen</h3>
                      <p className="text-2xl font-bold text-foreground" data-testid="stats-closed">
                        {stats?.closed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setCurrentView("create")} 
                className="px-6 py-3 font-medium flex items-center justify-center space-x-2"
                data-testid="button-create-ticket"
              >
                <Plus className="h-5 w-5" />
                <span>Yeni Destek Talebi</span>
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setCurrentView("list")} 
                className="px-6 py-3 font-medium flex items-center justify-center space-x-2"
                data-testid="button-my-tickets"
              >
                <List className="h-5 w-5" />
                <span>Taleplerim</span>
              </Button>
            </div>
          </div>
        );
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
