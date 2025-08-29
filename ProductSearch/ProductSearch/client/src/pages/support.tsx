import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, User, Calendar } from "lucide-react";

const ticketSchema = z.object({
  subject: z.string().min(5, "Konu en az 5 karakter olmalı"),
  category: z.string().min(1, "Kategori seçiniz"),
  priority: z.string().min(1, "Öncelik seçiniz"),
  description: z.string().min(20, "Açıklama en az 20 karakter olmalı"),
});

const messageSchema = z.object({
  message: z.string().min(1, "Mesaj boş olamaz"),
});

type TicketFormData = z.infer<typeof ticketSchema>;
type MessageFormData = z.infer<typeof messageSchema>;

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

export default function Support() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const ticketForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "",
      priority: "",
      description: "",
    },
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Mock data - in real app this would come from API
  const tickets: SupportTicket[] = [
    {
      id: "1",
      subject: "Sipariş teslimat problemi",
      category: "shipping",
      priority: "high",
      status: "open",
      description: "Siparişim 5 gündür kargoda bekliyor, takip numarası çalışmıyor.",
      createdAt: "2025-08-29T10:00:00Z",
      updatedAt: "2025-08-29T10:00:00Z",
      messages: [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          isAdmin: false,
          message: "Siparişim 5 gündür kargoda bekliyor, takip numarası çalışmıyor.",
          createdAt: "2025-08-29T10:00:00Z"
        },
        {
          id: "2",
          userId: "admin1",
          userName: "Destek Ekibi",
          isAdmin: true,
          message: "Merhaba, kargo firmasıyla iletişime geçtik. En kısa sürede size dönüş yapacağız.",
          createdAt: "2025-08-29T14:30:00Z"
        }
      ]
    },
    {
      id: "2",
      subject: "Ürün iade talebi",
      category: "returns",
      priority: "medium",
      status: "in_progress",
      description: "Aldığım telefon kutusundan hasarlı çıktı, iade etmek istiyorum.",
      createdAt: "2025-08-28T15:30:00Z",
      updatedAt: "2025-08-29T09:15:00Z",
      messages: [
        {
          id: "3",
          userId: "user2",
          userName: "Jane Smith",
          isAdmin: false,
          message: "Aldığım telefon kutusundan hasarlı çıktı, iade etmek istiyorum.",
          createdAt: "2025-08-28T15:30:00Z"
        },
        {
          id: "4",
          userId: "admin1",
          userName: "Destek Ekibi",
          isAdmin: true,
          message: "İade talebiniz inceleniyor. Ürün fotoğraflarını paylaşabilir misiniz?",
          createdAt: "2025-08-29T09:15:00Z"
        }
      ]
    },
    {
      id: "3",
      subject: "Hesap giriş sorunu",
      category: "account",
      priority: "low",
      status: "resolved",
      description: "E-posta adresimi değiştirdim ama giriş yapamıyorum.",
      createdAt: "2025-08-27T12:00:00Z",
      updatedAt: "2025-08-27T16:45:00Z",
      messages: [
        {
          id: "5",
          userId: "user3",
          userName: "Bob Wilson",
          isAdmin: false,
          message: "E-posta adresimi değiştirdim ama giriş yapamıyorum.",
          createdAt: "2025-08-27T12:00:00Z"
        },
        {
          id: "6",
          userId: "admin1",
          userName: "Destek Ekibi",
          isAdmin: true,
          message: "Hesabınız güncellenmiştir. Artık yeni e-posta adresinizle giriş yapabilirsiniz.",
          createdAt: "2025-08-27T16:45:00Z"
        }
      ]
    }
  ];

  const onSubmitTicket = async (data: TicketFormData) => {
    try {
      // API call would go here
      toast({
        title: "Destek talebi oluşturuldu",
        description: "Talebiniz başarıyla kaydedildi. En kısa sürede yanıtlanacaktır.",
      });
      ticketForm.reset();
      setShowNewTicketForm(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Talep oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const onSendMessage = async (data: MessageFormData) => {
    if (!selectedTicket) return;
    
    try {
      // API call would go here
      toast({
        title: "Mesaj gönderildi",
        description: "Mesajınız başarıyla gönderildi.",
      });
      messageForm.reset();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { variant: "destructive" as const, text: "Açık", icon: AlertCircle },
      in_progress: { variant: "outline" as const, text: "İnceleniyor", icon: Clock },
      resolved: { variant: "default" as const, text: "Çözüldü", icon: CheckCircle },
      closed: { variant: "secondary" as const, text: "Kapatıldı", icon: CheckCircle },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: "outline" as const, text: status, icon: HelpCircle };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { variant: "secondary" as const, text: "Düşük" },
      medium: { variant: "outline" as const, text: "Orta" },
      high: { variant: "destructive" as const, text: "Yüksek" },
    };
    
    const config = priorityMap[priority as keyof typeof priorityMap] || { variant: "outline" as const, text: priority };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getCategoryText = (category: string) => {
    const categoryMap = {
      shipping: "Kargo",
      returns: "İade",
      account: "Hesap",
      technical: "Teknik",
      billing: "Faturalama",
      other: "Diğer",
    };
    
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yardım Merkezi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sorularınız için destek talebi oluşturun ve mevcut taleplerini takip edin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList data-testid="support-tabs">
            <TabsTrigger value="my-tickets" data-testid="tab-my-tickets">Taleplerim</TabsTrigger>
            <TabsTrigger value="faq" data-testid="tab-faq">Sık Sorulan Sorular</TabsTrigger>
          </TabsList>

          <Dialog open={showNewTicketForm} onOpenChange={setShowNewTicketForm}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-ticket">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Talep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Destek Talebi</DialogTitle>
                <DialogDescription>
                  Sorununuzu detaylı bir şekilde açıklayın, size en kısa sürede yardımcı olalım.
                </DialogDescription>
              </DialogHeader>

              <Form {...ticketForm}>
                <form onSubmit={ticketForm.handleSubmit(onSubmitTicket)} className="space-y-4">
                  <FormField
                    control={ticketForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konu</FormLabel>
                        <FormControl>
                          <Input placeholder="Sorunuzun kısa başlığı" {...field} data-testid="input-subject" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={ticketForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Kategori seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="shipping">Kargo</SelectItem>
                              <SelectItem value="returns">İade</SelectItem>
                              <SelectItem value="account">Hesap</SelectItem>
                              <SelectItem value="technical">Teknik</SelectItem>
                              <SelectItem value="billing">Faturalama</SelectItem>
                              <SelectItem value="other">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Öncelik</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Öncelik seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Düşük</SelectItem>
                              <SelectItem value="medium">Orta</SelectItem>
                              <SelectItem value="high">Yüksek</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={ticketForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowNewTicketForm(false)}>
                      İptal
                    </Button>
                    <Button type="submit" data-testid="button-submit-ticket">
                      Talep Oluştur
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="my-tickets" className="space-y-6">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {selectedTicket.subject}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span>Talep #{selectedTicket.id}</span>
                      <span>{getCategoryText(selectedTicket.category)}</span>
                      {getPriorityBadge(selectedTicket.priority)}
                      {getStatusBadge(selectedTicket.status)}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedTicket(null)} data-testid="button-back-to-list">
                    ← Listeye Dön
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">İlk Mesaj</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedTicket.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Mesajlar</h4>
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex gap-3 ${message.isAdmin ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-1 max-w-[80%] ${message.isAdmin ? 'text-right' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          message.isAdmin 
                            ? 'bg-blue-100 dark:bg-blue-900' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-sm">{message.userName}</span>
                            {message.isAdmin && (
                              <Badge variant="secondary" className="text-xs">Destek</Badge>
                            )}
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'closed' && (
                  <>
                    <Separator />
                    <Form {...messageForm}>
                      <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4">
                        <FormField
                          control={messageForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Yeni Mesaj</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Mesajınızı yazın..."
                                  className="min-h-[80px]"
                                  {...field}
                                  data-testid="textarea-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" data-testid="button-send-message">
                          Mesaj Gönder
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Henüz destek talebiniz yok</h3>
                    <p className="text-gray-600 mb-4">Sorularınız için yeni bir destek talebi oluşturun</p>
                    <Button onClick={() => setShowNewTicketForm(true)}>
                      İlk Talebini Oluştur
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6" onClick={() => setSelectedTicket(ticket)}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <p className="text-gray-600 mt-1">Talep #{ticket.id}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        <span>{getCategoryText(ticket.category)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sık Sorulan Sorular</CardTitle>
              <CardDescription>
                En çok merak edilen konular ve yanıtları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Siparişim ne zaman kargoya verilecek?</h3>
                  <p className="text-gray-600 text-sm">
                    Siparişleriniz genellikle 1-2 iş günü içinde kargoya verilir. Kargo durumunu hesabınızdan takip edebilirsiniz.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Ürün iadesi nasıl yapabilirim?</h3>
                  <p className="text-gray-600 text-sm">
                    Ürün teslim tarihinden itibaren 14 gün içinde iade talebinde bulunabilirsiniz. İade süreci için destek talebi oluşturun.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Ödeme yöntemleri nelerdir?</h3>
                  <p className="text-gray-600 text-sm">
                    Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Tüm ödemeler SSL ile güvence altındadır.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Hesap bilgilerimi nasıl güncellerim?</h3>
                  <p className="text-gray-600 text-sm">
                    Kullanıcı ayarları sayfasından profil bilgilerinizi ve şifrenizi güncelleyebilirsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}