import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, Search, Filter, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const updateStockSchema = z.object({
  productId: z.string().min(1, "Ürün seçiniz"),
  quantity: z.coerce.number().min(0, "Stok miktarı 0'dan az olamaz"),
  reason: z.string().min(1, "Güncelleme sebebi seçiniz"),
});

type UpdateStockFormData = z.infer<typeof updateStockSchema>;

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: string;
  status: "normal" | "low" | "critical" | "overstock";
}

interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const updateStockForm = useForm<UpdateStockFormData>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      productId: "",
      quantity: 0,
      reason: "",
    },
  });

  // Mock data - in real app this would come from API
  const inventoryItems: InventoryItem[] = [
    {
      id: "1",
      productId: "prod-1",
      productName: "Samsung Galaxy S24 Ultra",
      category: "Elektronik",
      currentStock: 15,
      reservedStock: 3,
      availableStock: 12,
      minStockLevel: 10,
      maxStockLevel: 50,
      unitCost: 20000,
      totalValue: 300000,
      lastUpdated: "2025-08-29T10:00:00Z",
      status: "normal"
    },
    {
      id: "2",
      productId: "prod-2",
      productName: "MacBook Pro M3",
      category: "Bilgisayar",
      currentStock: 5,
      reservedStock: 2,
      availableStock: 3,
      minStockLevel: 8,
      maxStockLevel: 25,
      unitCost: 40000,
      totalValue: 200000,
      lastUpdated: "2025-08-29T09:30:00Z",
      status: "low"
    },
    {
      id: "3",
      productId: "prod-3",
      productName: "iPhone 15 Pro",
      category: "Elektronik",
      currentStock: 2,
      reservedStock: 1,
      availableStock: 1,
      minStockLevel: 5,
      maxStockLevel: 30,
      unitCost: 35000,
      totalValue: 70000,
      lastUpdated: "2025-08-28T16:45:00Z",
      status: "critical"
    },
    {
      id: "4",
      productId: "prod-4",
      productName: "AirPods Pro 2",
      category: "Elektronik",
      currentStock: 75,
      reservedStock: 5,
      availableStock: 70,
      minStockLevel: 20,
      maxStockLevel: 60,
      unitCost: 8000,
      totalValue: 600000,
      lastUpdated: "2025-08-29T08:15:00Z",
      status: "overstock"
    }
  ];

  const stockTransactions: StockTransaction[] = [
    {
      id: "1",
      productId: "prod-1",
      productName: "Samsung Galaxy S24 Ultra",
      type: "in",
      quantity: 10,
      reason: "Yeni sevkiyat",
      createdBy: "Admin",
      createdAt: "2025-08-29T10:00:00Z"
    },
    {
      id: "2",
      productId: "prod-2",
      productName: "MacBook Pro M3",
      type: "out",
      quantity: 2,
      reason: "Satış",
      createdBy: "Sistem",
      createdAt: "2025-08-29T09:30:00Z"
    },
    {
      id: "3",
      productId: "prod-3",
      productName: "iPhone 15 Pro",
      type: "adjustment",
      quantity: -1,
      reason: "Hasar düzeltmesi",
      createdBy: "Admin",
      createdAt: "2025-08-28T16:45:00Z"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      normal: { variant: "default" as const, text: "Normal", icon: Package },
      low: { variant: "outline" as const, text: "Düşük Stok", icon: TrendingDown },
      critical: { variant: "destructive" as const, text: "Kritik", icon: AlertTriangle },
      overstock: { variant: "secondary" as const, text: "Fazla Stok", icon: TrendingUp },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: "outline" as const, text: status, icon: Package };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getTransactionBadge = (type: string) => {
    const typeMap = {
      in: { variant: "default" as const, text: "Giriş", icon: Plus },
      out: { variant: "secondary" as const, text: "Çıkış", icon: Minus },
      adjustment: { variant: "outline" as const, text: "Düzeltme", icon: Package },
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { variant: "outline" as const, text: type, icon: Package };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lowStockItems = inventoryItems.filter(item => item.status === "low" || item.status === "critical");
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const totalProducts = inventoryItems.length;

  const onUpdateStock = async (data: UpdateStockFormData) => {
    try {
      // API call would go here
      toast({
        title: "Stok güncellendi",
        description: "Stok miktarı başarıyla güncellendi.",
      });
      updateStockForm.reset();
      setShowUpdateDialog(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Stok güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stok Yönetimi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ürün stoklarınızı takip edin ve yönetin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-products">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Farklı ürün çeşidi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-value">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Envanter değeri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="stat-low-stock">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Dikkat gerekli</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritik Stok</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-critical-stock">
              {inventoryItems.filter(item => item.status === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Acil eylem gerekli</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>{lowStockItems.length} ürünün stok seviyesi düşük!</strong>
            {" "}Bu ürünler için yeniden sipariş vermeyi düşünün.
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Management */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Stok Listesi</CardTitle>
              <CardDescription>Tüm ürünlerin stok durumunu görüntüleyin ve yönetin</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-update-stock">
                    <Package className="h-4 w-4 mr-2" />
                    Stok Güncelle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Stok Güncelle</DialogTitle>
                    <DialogDescription>
                      Ürün stok miktarını güncelleyin
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...updateStockForm}>
                    <form onSubmit={updateStockForm.handleSubmit(onUpdateStock)} className="space-y-4">
                      <FormField
                        control={updateStockForm.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ürün</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product">
                                  <SelectValue placeholder="Ürün seçiniz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {inventoryItems.map((item) => (
                                  <SelectItem key={item.productId} value={item.productId}>
                                    {item.productName} (Mevcut: {item.currentStock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={updateStockForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Yeni Stok Miktarı</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Stok miktarı" 
                                {...field} 
                                data-testid="input-quantity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={updateStockForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Güncelleme Sebebi</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-reason">
                                  <SelectValue placeholder="Sebep seçiniz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="restock">Yeniden Stok</SelectItem>
                                <SelectItem value="sale">Satış</SelectItem>
                                <SelectItem value="damage">Hasar</SelectItem>
                                <SelectItem value="adjustment">Manuel Düzeltme</SelectItem>
                                <SelectItem value="return">İade</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowUpdateDialog(false)}>
                          İptal
                        </Button>
                        <Button type="submit" data-testid="button-submit-update">
                          Stok Güncelle
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" data-testid="button-export-inventory">
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Düşük Stok</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
                <SelectItem value="overstock">Fazla Stok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Mevcut Stok</TableHead>
                <TableHead>Rezerve</TableHead>
                <TableHead>Müsait</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Birim Maliyet</TableHead>
                <TableHead>Toplam Değer</TableHead>
                <TableHead>Son Güncelleme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      item.currentStock <= item.minStockLevel ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {item.currentStock}
                    </span>
                  </TableCell>
                  <TableCell>{item.reservedStock}</TableCell>
                  <TableCell>{item.availableStock}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(item.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Son Stok Hareketleri</CardTitle>
          <CardDescription>Son yapılan stok güncellemeleri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>İşlem Tipi</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>Yapan</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.productName}</TableCell>
                  <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      transaction.type === 'out' ? 'text-red-600' : 
                      transaction.type === 'in' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'out' ? '-' : transaction.type === 'in' ? '+' : ''}
                      {Math.abs(transaction.quantity)}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell>{transaction.createdBy}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}