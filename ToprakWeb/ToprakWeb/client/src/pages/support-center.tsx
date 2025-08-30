import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TicketIcon, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  Plus, 
  Search,
  Filter,
  HelpCircle,
  FileText,
  Phone,
  Mail
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Ticket } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const ticketFormSchema = z.object({
  subject: z.string().min(5, "Başlık en az 5 karakter olmalı"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalı"),
  priority: z.enum(["düşük", "orta", "yüksek", "acil"]),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

const CATEGORIES = [
  "Teknik Destek",
  "Faturalama",
  "Hesap Sorunları", 
  "Ürün Sorguları",
  "Geri Bildirim",
  "Diğer"
];

const PRIORITIES = [
  { value: "düşük", label: "Düşük", color: "bg-green-100 text-green-800" },
  { value: "orta", label: "Orta", color: "bg-yellow-100 text-yellow-800" },
  { value: "yüksek", label: "Yüksek", color: "bg-orange-100 text-orange-800" },
  { value: "acil", label: "Acil", color: "bg-red-100 text-red-800" }
];

const STATUS_CONFIG = [
  { value: "açık", label: "Açık", color: "bg-blue-100 text-blue-800", icon: Clock },
  { value: "yanıtlandı", label: "Yanıtlandı", color: "bg-green-100 text-green-800", icon: MessageCircle },
  { value: "kapalı", label: "Kapalı", color: "bg-gray-100 text-gray-800", icon: CheckCircle }
];

export default function SupportCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "orta",
    },
  });

  // Fetch tickets with filtering
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets", searchQuery, selectedStatus, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      
      const response = await fetch(`/api/tickets?${params}`);
      if (!response.ok) throw new Error("Biletler yüklenemedi");
      return response.json();
    },
  });

  // Fetch support stats
  const { data: stats } = useQuery({
    queryKey: ["/api/tickets/stats"],
    queryFn: async () => {
      const response = await fetch("/api/tickets/stats");
      if (!response.ok) return { total: 0, open: 0, responded: 0, closed: 0 };
      return response.json();
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Bilet oluşturulamadı");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/stats"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Başarılı!",
        description: "Destek talebi başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Destek talebi oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG.find(s => s.value === status) || STATUS_CONFIG[0];
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchQuery === "" || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout 
      title="Destek Merkezi" 
      subtitle="Destek talepleri oluşturun ve takip edin"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TicketIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Talepler</p>
                  <p className="text-2xl font-bold" data-testid="stats-total">
                    {stats?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bekleyen</p>
                  <p className="text-2xl font-bold text-amber-600" data-testid="stats-open">
                    {stats?.open || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Yanıtlanan</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="stats-responded">
                    {stats?.responded || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Çözülen</p>
                  <p className="text-2xl font-bold text-blue-600" data-testid="stats-closed">
                    {stats?.closed || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Talep ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-status">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {STATUS_CONFIG.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                <SelectValue placeholder="Kategori filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2" data-testid="button-create-ticket">
                <Plus className="h-4 w-4" />
                <span>Yeni Talep</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Destek Talebi</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Başlık</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Sorun başlığı" 
                            {...field} 
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Öncelik</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITIES.map(priority => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Sorununuzu detaylı olarak açıklayın..." 
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTicketMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createTicketMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Destek Talepleri</span>
              <Badge variant="secondary">
                {filteredTickets.length} sonuç
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8" data-testid="empty-state">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Destek talebi bulunamadı
                </h3>
                <p className="text-muted-foreground mb-4">
                  Henüz bir destek talebiniz yok veya filtrelerinize uygun sonuç bulunamadı.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  İlk Talebinizi Oluşturun
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="tickets-list">
                {filteredTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status);
                  const priorityConfig = getPriorityConfig(ticket.priority);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div 
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      data-testid={`ticket-${ticket.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold" data-testid={`ticket-subject-${ticket.id}`}>
                              {ticket.subject}
                            </h3>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className={priorityConfig.color}>
                              {priorityConfig.label}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3 line-clamp-2" data-testid={`ticket-description-${ticket.id}`}>
                            {ticket.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>#{ticket.id}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString("tr-TR")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">SSS</h3>
              <p className="text-muted-foreground mb-4">
                Sık sorulan sorulara göz atın
              </p>
              <Button variant="outline">SSS Görüntüle</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Telefon Desteği</h3>
              <p className="text-muted-foreground mb-4">
                7/24 telefon desteği
              </p>
              <Button variant="outline">+90 212 555 0123</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">E-posta Desteği</h3>
              <p className="text-muted-foreground mb-4">
                E-posta ile iletişim kurun
              </p>
              <Button variant="outline">destek@toprak.com</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}