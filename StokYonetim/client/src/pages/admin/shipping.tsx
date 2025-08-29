import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Truck, Package, Clock, CheckCircle, Calendar, Search } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import type { ShippingWithOrder, UpdateShipping, ShippingStats } from "@shared/schema";

export default function AdminShipping() {
  const [selectedShipping, setSelectedShipping] = useState<ShippingWithOrder | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shippings = [], isLoading } = useQuery<ShippingWithOrder[]>({
    queryKey: ["/api/shipping"],
  });

  const { data: stats } = useQuery<ShippingStats>({
    queryKey: ["/api/shipping/stats"],
  });

  const updateShippingMutation = useMutation({
    mutationFn: (data: UpdateShipping) => apiRequest("/api/shipping/update", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipping/stats"] });
      setUpdateDialogOpen(false);
      setSelectedShipping(null);
      toast({
        title: "Başarılı",
        description: "Kargo durumu güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kargo durumu güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      preparing: { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-800" },
      shipped: { label: "Kargoya Verildi", color: "bg-blue-100 text-blue-800" },
      in_transit: { label: "Yolda", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
      returned: { label: "İade", color: "bg-red-100 text-red-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.preparing;
    return <Badge className={config.color} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  const filteredShippings = shippings.filter((shipping) =>
    shipping.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipping.order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof shipping.order.shippingAddress === 'object' && 
     shipping.order.shippingAddress && 
     'name' in shipping.order.shippingAddress &&
     typeof shipping.order.shippingAddress.name === 'string' &&
     shipping.order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateShipping = (values: any) => {
    if (!selectedShipping) return;

    const updateData: UpdateShipping = {
      orderId: selectedShipping.orderId,
      shippingStatus: values.shippingStatus,
      carrierName: values.carrierName,
      notes: values.notes,
      shippedAt: values.shippedAt ? new Date(values.shippedAt).toISOString() : undefined,
      estimatedDelivery: values.estimatedDelivery ? new Date(values.estimatedDelivery).toISOString() : undefined,
      deliveredAt: values.deliveredAt ? new Date(values.deliveredAt).toISOString() : undefined,
    };

    updateShippingMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-sm text-muted-foreground">Kargolar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-shipping-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kargo Yönetimi</h1>
            <p className="text-muted-foreground">
              Siparişlerin kargo durumlarını takip edin ve güncelleyin
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Takip no, sipariş ID veya müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hazırlanıyor</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="stat-preparing">{stats.preparing}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kargoya Verildi</CardTitle>
                <Truck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-shipped">{stats.shipped}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yolda</CardTitle>
                <Package className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-intransit">{stats.inTransit}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teslim Edildi</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-delivered">{stats.delivered}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shippings List */}
        <Card>
          <CardHeader>
            <CardTitle>Kargo Takip Listesi</CardTitle>
            <CardDescription>
              {filteredShippings.length} kargo kaydı bulundu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredShippings.map((shipping) => (
                <div
                  key={shipping.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  data-testid={`shipping-card-${shipping.id}`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium" data-testid={`tracking-number-${shipping.trackingNumber}`}>
                        {shipping.trackingNumber}
                      </span>
                      {getStatusBadge(shipping.shippingStatus)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Sipariş: {shipping.order.id}</p>
                      <p>Müşteri: {
                        typeof shipping.order.shippingAddress === 'object' && 
                        shipping.order.shippingAddress && 
                        'name' in shipping.order.shippingAddress &&
                        typeof shipping.order.shippingAddress.name === 'string'
                          ? shipping.order.shippingAddress.name 
                          : 'N/A'
                      }</p>
                      <p>Kargo Firması: {shipping.carrierName}</p>
                      {shipping.estimatedDelivery && (
                        <p>Tahmini Teslimat: {format(new Date(shipping.estimatedDelivery), "dd MMMM yyyy", { locale: tr })}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedShipping(shipping);
                        setUpdateDialogOpen(true);
                      }}
                      data-testid={`button-update-${shipping.id}`}
                    >
                      Güncelle
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredShippings.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm ? "Arama kriterlerine uygun kargo bulunamadı" : "Henüz kargo kaydı bulunmuyor"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Update Shipping Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]" data-testid="dialog-update-shipping">
            <DialogHeader>
              <DialogTitle>Kargo Durumunu Güncelle</DialogTitle>
              <DialogDescription>
                {selectedShipping?.trackingNumber} takip numaralı kargo için durum güncellemesi
              </DialogDescription>
            </DialogHeader>
            
            {selectedShipping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const values = Object.fromEntries(formData.entries());
                  handleUpdateShipping(values);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="shippingStatus">Kargo Durumu</Label>
                  <Select name="shippingStatus" defaultValue={selectedShipping.shippingStatus} required>
                    <SelectTrigger data-testid="select-shipping-status">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparing">Hazırlanıyor</SelectItem>
                      <SelectItem value="shipped">Kargoya Verildi</SelectItem>
                      <SelectItem value="in_transit">Yolda</SelectItem>
                      <SelectItem value="delivered">Teslim Edildi</SelectItem>
                      <SelectItem value="returned">İade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrierName">Kargo Firması</Label>
                  <Input
                    name="carrierName"
                    defaultValue={selectedShipping.carrierName}
                    placeholder="Kargo firması adı"
                    data-testid="input-carrier-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippedAt">Kargo Tarihi</Label>
                    <Input
                      name="shippedAt"
                      type="datetime-local"
                      defaultValue={selectedShipping.shippedAt ? format(new Date(selectedShipping.shippedAt), "yyyy-MM-dd'T'HH:mm") : ""}
                      data-testid="input-shipped-at"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveredAt">Teslimat Tarihi</Label>
                    <Input
                      name="deliveredAt"
                      type="datetime-local"
                      defaultValue={selectedShipping.deliveredAt ? format(new Date(selectedShipping.deliveredAt), "yyyy-MM-dd'T'HH:mm") : ""}
                      data-testid="input-delivered-at"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Tahmini Teslimat</Label>
                  <Input
                    name="estimatedDelivery"
                    type="datetime-local"
                    defaultValue={selectedShipping.estimatedDelivery ? format(new Date(selectedShipping.estimatedDelivery), "yyyy-MM-dd'T'HH:mm") : ""}
                    data-testid="input-estimated-delivery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    name="notes"
                    defaultValue={selectedShipping.notes || ""}
                    placeholder="Kargo ile ilgili notlar..."
                    data-testid="textarea-notes"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUpdateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateShippingMutation.isPending}
                    data-testid="button-save"
                  >
                    {updateShippingMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}