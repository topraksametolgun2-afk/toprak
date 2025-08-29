import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Truck, Clock, CheckCircle, Search, Calendar, MapPin, Phone, User, Copy } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { OrderWithShipping } from "@shared/schema";

export default function UserOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithShipping | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const { toast } = useToast();

  // For demo purposes, using a hardcoded user ID. In real app, this would come from auth context
  // Using actual customer user ID from sample data
  const userId = "641d9e8f-0d8f-4c00-9ba8-7a35ba72c236";

  const { data: orders = [], isLoading } = useQuery<OrderWithShipping[]>({
    queryKey: ["/api/orders/user", userId],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Beklemede", color: "bg-gray-100 text-gray-800", icon: Clock },
      confirmed: { label: "Onaylandı", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      preparing: { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-800", icon: Package },
      shipped: { label: "Kargoya Verildi", color: "bg-blue-100 text-blue-800", icon: Truck },
      delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { label: "İptal Edildi", color: "bg-red-100 text-red-800", icon: Clock },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`} data-testid={`badge-order-status-${status}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getShippingStatusBadge = (status: string) => {
    const statusConfig = {
      preparing: { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-800" },
      shipped: { label: "Kargoya Verildi", color: "bg-blue-100 text-blue-800" },
      in_transit: { label: "Yolda", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
      returned: { label: "İade", color: "bg-red-100 text-red-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.preparing;
    return <Badge className={config.color} data-testid={`badge-shipping-status-${status}`}>{config.label}</Badge>;
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast({
      title: "Kopyalandı",
      description: "Takip numarası panoya kopyalandı",
    });
  };

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping?.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="mt-2 text-sm text-muted-foreground">Siparişleriniz yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" data-testid="user-orders-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Siparişlerim</h1>
            <p className="text-muted-foreground">
              Verdiğiniz siparişleri ve kargo durumlarını takip edin
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sipariş ID veya takip numarası ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
                data-testid="input-search-orders"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden" data-testid={`order-card-${order.id}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Sipariş #{order.id.slice(-8).toUpperCase()}</CardTitle>
                    <CardDescription>
                      {order.createdAt && format(new Date(order.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Sipariş Detayları</h4>
                  {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Ürün ID: {String(item?.productId || '')}</p>
                        <p className="text-sm text-muted-foreground">Adet: {String(item?.quantity || '')}</p>
                      </div>
                      <p className="font-medium">₺{parseFloat(String(item?.price || '0')).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Toplam:</span>
                    <span className="font-bold text-lg">₺{parseFloat(order.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Shipping Information */}
                {order.shipping && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Kargo Bilgileri
                      </h4>
                      {getShippingStatusBadge(order.shipping.shippingStatus)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Takip No:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono" data-testid={`tracking-number-${order.shipping.trackingNumber}`}>
                              {order.shipping.trackingNumber}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyTrackingNumber(order.shipping!.trackingNumber)}
                              data-testid={`button-copy-tracking-${order.id}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Kargo Firması:</span>
                          <span className="ml-1">{order.shipping.carrierName}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.shipping.shippedAt && (
                          <div>
                            <span className="font-medium">Kargo Tarihi:</span>
                            <span className="ml-1">
                              {format(new Date(order.shipping.shippedAt), "dd MMM yyyy", { locale: tr })}
                            </span>
                          </div>
                        )}
                        {order.shipping.estimatedDelivery && (
                          <div>
                            <span className="font-medium">Tahmini Teslimat:</span>
                            <span className="ml-1">
                              {format(new Date(order.shipping.estimatedDelivery), "dd MMM yyyy", { locale: tr })}
                            </span>
                          </div>
                        )}
                        {order.shipping.deliveredAt && (
                          <div>
                            <span className="font-medium">Teslimat Tarihi:</span>
                            <span className="ml-1 text-green-600 font-medium">
                              {format(new Date(order.shipping.deliveredAt), "dd MMM yyyy HH:mm", { locale: tr })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {order.shipping.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Not:</span> {order.shipping.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && typeof order.shippingAddress === 'object' && (
                  <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Teslimat Adresi
                    </h4>
                    <div className="text-sm space-y-1">
                      {'name' in order.shippingAddress && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.shippingAddress.name as string}</span>
                        </div>
                      )}
                      {'address' in order.shippingAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{order.shippingAddress.address as string}</span>
                        </div>
                      )}
                      {'phone' in order.shippingAddress && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.shippingAddress.phone as string}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  {order.shipping && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" data-testid={`button-track-order-${order.id}`}>
                          <Truck className="h-4 w-4 mr-2" />
                          Kargo Takip
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]" data-testid={`dialog-tracking-${order.id}`}>
                        <DialogHeader>
                          <DialogTitle>Kargo Takip Detayları</DialogTitle>
                          <DialogDescription>
                            Sipariş #{order.id.slice(-8).toUpperCase()} için kargo takip bilgileri
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                              <Truck className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-mono text-lg font-medium">{order.shipping.trackingNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping.carrierName}</p>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              {getShippingStatusBadge(order.shipping.shippingStatus)}
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              {order.shipping.shippedAt && (
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span>Kargo Tarihi:</span>
                                  <span className="font-medium">
                                    {format(new Date(order.shipping.shippedAt), "dd MMM yyyy HH:mm", { locale: tr })}
                                  </span>
                                </div>
                              )}
                              
                              {order.shipping.estimatedDelivery && (
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span>Tahmini Teslimat:</span>
                                  <span className="font-medium">
                                    {format(new Date(order.shipping.estimatedDelivery), "dd MMM yyyy", { locale: tr })}
                                  </span>
                                </div>
                              )}
                              
                              {order.shipping.deliveredAt && (
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                  <span>Teslimat Tarihi:</span>
                                  <span className="font-medium text-green-600">
                                    {format(new Date(order.shipping.deliveredAt), "dd MMM yyyy HH:mm", { locale: tr })}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {order.shipping.notes && (
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm">
                                  <span className="font-medium">Son Durum:</span> {order.shipping.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredOrders.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "Arama kriterlerine uygun sipariş bulunamadı" : "Henüz hiç sipariş vermediniz"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Farklı arama terimleri deneyebilirsiniz" : "İlk siparişinizi vermek için ürünleri inceleyin"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}