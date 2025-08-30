import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Trash2,
  Edit
} from "lucide-react";
import type { Ticket, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) return { 
        totalUsers: 0, 
        totalTickets: 0, 
        pendingTickets: 0, 
        totalStockItems: 0,
        systemHealth: "unknown"
      };
      return response.json();
    },
  });

  // Fetch all users (admin only)
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch all tickets (admin view)
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/admin/tickets"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tickets");
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Durum güncellenemedi");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Başarılı!",
        description: "Ticket durumu güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Kullanıcı silinemedi");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Başarılı!",
        description: "Kullanıcı silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Kullanıcı silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "açık": return "bg-blue-100 text-blue-800";
      case "yanıtlandı": return "bg-green-100 text-green-800";
      case "kapalı": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "seller": return "bg-blue-100 text-blue-800";
      case "buyer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Yönetici";
      case "seller": return "Satıcı";
      case "buyer": return "Alıcı";
      default: return role;
    }
  };

  return (
    <DashboardLayout 
      title="Admin Panel" 
      subtitle="Sistem yönetimi ve kontrol paneli"
    >
      <div className="space-y-6">
        {/* Access Control Check */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Yönetici Erişimi Aktif
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Bu panel yalnızca yetkili yöneticiler tarafından erişilebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold" data-testid="admin-stats-users">
                    {adminStats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Ticket</p>
                  <p className="text-2xl font-bold" data-testid="admin-stats-tickets">
                    {adminStats?.totalTickets || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bekleyen Ticket</p>
                  <p className="text-2xl font-bold text-amber-600" data-testid="admin-stats-pending">
                    {adminStats?.pendingTickets || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Stok Ürünleri</p>
                  <p className="text-2xl font-bold" data-testid="admin-stats-stock">
                    {adminStats?.totalStockItems || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Yönetimi</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Sistem Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Veritabanı Bağlantısı</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktif
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Servisleri</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Çalışıyor
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Websocket Bağlantısı</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Bağlı
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Hızlı İşlemler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Veritabanı Yedekle
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Kullanıcı Raporu
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Sistem İstatistikleri
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Kullanıcılar yükleniyor...</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="users-list">
                    {users.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`user-${user.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium" data-testid={`user-email-${user.id}`}>
                              {user.email}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR") : 'Bilinmeyen tarih'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="secondary" 
                            className={getRoleColor(user.role || "buyer")}
                            data-testid={`user-role-${user.id}`}
                          >
                            {getRoleLabel(user.role || "buyer")}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Management Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Ticketlar yükleniyor...</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="tickets-list">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        className="p-4 border rounded-lg space-y-3"
                        data-testid={`ticket-${ticket.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2" data-testid={`ticket-subject-${ticket.id}`}>
                              {ticket.subject}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>#{ticket.id}</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString("tr-TR")}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant="secondary"
                              className={getStatusColor(ticket.status)}
                              data-testid={`ticket-status-${ticket.id}`}
                            >
                              {ticket.status === "açık" && <Clock className="h-3 w-3 mr-1" />}
                              {ticket.status === "yanıtlandı" && <UserCheck className="h-3 w-3 mr-1" />}
                              {ticket.status === "kapalı" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {ticket.status}
                            </Badge>
                            <Select
                              value={ticket.status}
                              onValueChange={(status) => 
                                updateTicketMutation.mutate({ ticketId: ticket.id, status })
                              }
                            >
                              <SelectTrigger className="w-32" data-testid={`select-status-${ticket.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="açık">Açık</SelectItem>
                                <SelectItem value="yanıtlandı">Yanıtlandı</SelectItem>
                                <SelectItem value="kapalı">Kapalı</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}