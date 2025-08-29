import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, MessageCircle, Package, Calendar, User, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const orderFormSchema = insertOrderSchema.omit({ buyerId: true });

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function OrdersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: OrderFormData) => {
      return fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Başarılı",
        description: "Sipariş başarıyla oluşturuldu",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sipariş oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      productName: "",
      quantity: 1,
      totalPrice: 0,
      notes: "",
      status: "pending",
    },
  });

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "confirmed":
        return "Onaylandı";
      case "in_progress":
        return "İşlemde";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="flex-1 space-y-6 p-6" data-testid="orders-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            Siparişler
          </h1>
          <p className="text-muted-foreground">
            Siparişlerinizi yönetin ve mesajlaşın
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-order">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Sipariş
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Sipariş Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir sipariş oluşturun ve tedarikçinizle iletişime geçin.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ürün Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="Ürün adını girin" {...field} data-testid="input-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tedarikçi ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Tedarikçi ID" {...field} data-testid="input-supplier-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miktar</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Fiyat (₺)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-total-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notlar (İsteğe bağlı)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Sipariş hakkında ek bilgiler..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
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
                    disabled={createOrderMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createOrderMutation.isPending ? "Oluşturuluyor..." : "Sipariş Oluştur"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz sipariş yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              İlk siparişinizi oluşturun ve tedarikçilerinizle iletişime geçin.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-order">
              <Plus className="h-4 w-4 mr-2" />
              İlk Siparişi Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-product-name-${order.id}`}>
                        {order.productName}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: tr })}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {order.supplierId}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(order.status)} data-testid={`status-${order.id}`}>
                      {getStatusText(order.status)}
                    </Badge>
                    <Link href={`/messages/${order.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-messages-${order.id}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Mesajlar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Miktar</p>
                    <p className="font-medium" data-testid={`text-quantity-${order.id}`}>
                      {order.quantity} adet
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Fiyat</p>
                    <p className="font-medium flex items-center" data-testid={`text-price-${order.id}`}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      {order.totalPrice.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Notlar</p>
                    <p className="text-sm mt-1" data-testid={`text-notes-${order.id}`}>
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}