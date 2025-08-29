import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Package, ShoppingCart, AlertTriangle, Plus, Edit, Trash2, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fake data for demo - in real app these would come from API
  const stats = {
    totalUsers: 150,
    totalProducts: 25,
    totalOrders: 300,
    lowStockItems: 5,
  };

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "BUYER", company: "ABC Ltd" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "SELLER", company: "XYZ Corp" },
    { id: 3, name: "Admin User", email: "admin@example.com", role: "ADMIN", company: null },
  ];

  const products = [
    { id: 1, name: "Samsung Galaxy S24", price: 25000, stock: 15, category: "Elektronik" },
    { id: 2, name: "MacBook Pro", price: 45000, stock: 8, category: "Bilgisayar" },
    { id: 3, name: "iPhone 15", price: 35000, stock: 3, category: "Elektronik" },
  ];

  const orders = [
    { id: 1, customer: "John Doe", product: "Samsung Galaxy S24", quantity: 2, status: "PENDING", total: 50000 },
    { id: 2, customer: "Jane Smith", product: "MacBook Pro", quantity: 1, status: "APPROVED", total: 45000 },
    { id: 3, customer: "Bob Wilson", product: "iPhone 15", quantity: 1, status: "SHIPPED", total: 35000 },
  ];

  const supportTickets = [
    { id: 1, customer: "John Doe", subject: "Sipariş problemi", status: "OPEN", created: "2025-08-29" },
    { id: 2, customer: "Jane Smith", subject: "Ürün hatası", status: "IN_PROGRESS", created: "2025-08-28" },
    { id: 3, customer: "Bob Wilson", subject: "Kargo sorunu", status: "RESOLVED", created: "2025-08-27" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { variant: "outline" as const, text: "Bekliyor" },
      APPROVED: { variant: "default" as const, text: "Onaylandı" },
      REJECTED: { variant: "destructive" as const, text: "Reddedildi" },
      SHIPPED: { variant: "secondary" as const, text: "Kargoda" },
      DELIVERED: { variant: "default" as const, text: "Teslim Edildi" },
      OPEN: { variant: "destructive" as const, text: "Açık" },
      IN_PROGRESS: { variant: "outline" as const, text: "İnceleniyor" },
      RESOLVED: { variant: "default" as const, text: "Çözüldü" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: "outline" as const, text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      ADMIN: { variant: "destructive" as const, text: "Admin" },
      SELLER: { variant: "default" as const, text: "Satıcı" },
      BUYER: { variant: "secondary" as const, text: "Alıcı" },
    };
    
    const config = roleMap[role as keyof typeof roleMap] || { variant: "outline" as const, text: role };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Paneli</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sistem yönetimi ve raporları
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5" data-testid="admin-tabs">
          <TabsTrigger value="overview" data-testid="tab-overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Ürünler</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Siparişler</TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">Destek</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-users">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">+12% geçen aydan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-products">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">+3 yeni ürün</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-orders">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+8% bu hafta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="stat-lowstock">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Dikkat gerekiyor</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Son Siparişler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.product}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-sm text-gray-600 mt-1">{order.total.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kritik Stok Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.filter(p => p.stock < 10).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.stock < 5 ? "destructive" : "outline"}>
                          {product.stock} adet
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
              <CardDescription>Sisteme kayıtlı kullanıcıları yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.company || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-user-${user.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-delete-user-${user.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ürün Yönetimi</CardTitle>
                <CardDescription>Mağazadaki ürünleri yönetin</CardDescription>
              </div>
              <Button data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price.toLocaleString('tr-TR')} ₺</TableCell>
                      <TableCell>
                        <Badge variant={product.stock < 5 ? "destructive" : product.stock < 10 ? "outline" : "default"}>
                          {product.stock} adet
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-product-${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-delete-product-${product.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Yönetimi</CardTitle>
              <CardDescription>Sistem siparişlerini takip edin ve yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş ID</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.total.toLocaleString('tr-TR')} ₺</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                            Görüntüle
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Destek Talepleri</CardTitle>
              <CardDescription>Müşteri destek taleplerini yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Konu</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id}</TableCell>
                      <TableCell>{ticket.customer}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{ticket.created}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-view-ticket-${ticket.id}`}>
                            Görüntüle
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-reply-ticket-${ticket.id}`}>
                            Yanıtla
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}