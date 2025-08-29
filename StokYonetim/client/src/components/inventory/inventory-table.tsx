import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RotateCcw, Download, Eye, Edit, Trash2, Search } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StockEditModal from "./stock-edit-modal";
import type { ProductWithInventory } from "@shared/schema";

export default function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<ProductWithInventory[]>({
    queryKey: ["/api/inventory"],
  });

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (statusFilter) {
      case "in-stock":
        return product.inventory.currentStock > product.inventory.criticalLevel;
      case "critical":
        return product.inventory.currentStock > 0 && product.inventory.currentStock <= product.inventory.criticalLevel;
      case "out-of-stock":
        return product.inventory.currentStock === 0;
      default:
        return true;
    }
  });

  const handleEditStock = (product: ProductWithInventory) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (productId: string) => {
    // Navigate to product detail page
    window.open(`/product/${productId}`, '_blank');
  };

  const getStockStatus = (product: ProductWithInventory) => {
    if (product.inventory.currentStock === 0) {
      return {
        label: "Tükendi",
        variant: "destructive" as const,
        icon: "fas fa-times-circle",
        testId: "badge-out-of-stock"
      };
    }
    if (product.inventory.currentStock <= product.inventory.criticalLevel) {
      return {
        label: "Kritik Seviye",
        variant: "secondary" as const,
        icon: "fas fa-exclamation-triangle",
        className: "bg-amber-100 text-amber-800",
        testId: "badge-critical"
      };
    }
    return {
      label: "Stokta",
      variant: "secondary" as const,
      icon: "fas fa-check-circle",
      className: "bg-green-100 text-green-800",
      testId: "badge-in-stock"
    };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    }
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Button className="flex items-center" data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün Ekle
              </Button>
              <Button variant="outline" className="flex items-center" data-testid="button-refresh-stock">
                <RotateCcw className="w-4 h-4 mr-2" />
                Stok Güncelle
              </Button>
              <Button variant="outline" className="flex items-center" data-testid="button-download-report">
                <Download className="w-4 h-4 mr-2" />
                Rapor İndir
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto" data-testid="select-status-filter">
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="in-stock">Stokta Var</SelectItem>
                  <SelectItem value="critical">Kritik Seviye</SelectItem>
                  <SelectItem value="out-of-stock">Tükendi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Envanteri</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-md"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/6"></div>
                    </div>
                    <div className="w-20 h-4 bg-muted rounded"></div>
                    <div className="w-16 h-4 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Mevcut Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Kritik Seviye
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Son Güncelleme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        {searchTerm || statusFilter !== "all" 
                          ? "Arama kriterlerinize uygun ürün bulunamadı."
                          : "Henüz ürün eklenmemiş."}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <tr 
                          key={product.id} 
                          className="hover:bg-muted/20 transition-colors"
                          data-testid={`row-product-${product.id}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={product.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=64&h=64&fit=crop"} 
                                alt={product.name}
                                className="w-10 h-10 rounded-md object-cover"
                                data-testid={`img-product-${product.id}`}
                              />
                              <div className="ml-4">
                                <div 
                                  className="text-sm font-medium"
                                  data-testid={`text-product-name-${product.id}`}
                                >
                                  {product.name}
                                </div>
                                <div 
                                  className="text-sm text-muted-foreground"
                                  data-testid={`text-product-sku-${product.id}`}
                                >
                                  SKU: {product.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground"
                            data-testid={`text-product-category-${product.id}`}
                          >
                            {product.category?.name || "Kategori yok"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span 
                                className={`text-sm font-medium ${
                                  product.inventory.currentStock === 0 ? "text-destructive" :
                                  product.inventory.currentStock <= product.inventory.criticalLevel ? "text-amber-600" :
                                  "text-foreground"
                                }`}
                                data-testid={`text-current-stock-${product.id}`}
                              >
                                {product.inventory.currentStock}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-6 w-6 p-0"
                                onClick={() => handleEditStock(product)}
                                data-testid={`button-edit-stock-${product.id}`}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground"
                            data-testid={`text-critical-level-${product.id}`}
                          >
                            {product.inventory.criticalLevel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={stockStatus.variant}
                              className={stockStatus.className}
                              data-testid={`${stockStatus.testId}-${product.id}`}
                            >
                              {stockStatus.label}
                            </Badge>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground"
                            data-testid={`text-last-updated-${product.id}`}
                          >
                            {product.inventory.lastUpdated ? formatTimeAgo(new Date(product.inventory.lastUpdated)) : 'Bilinmiyor'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProduct(product.id)}
                                data-testid={`button-view-product-${product.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStock(product)}
                                data-testid={`button-edit-product-${product.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                data-testid={`button-delete-product-${product.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 bg-muted/20 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                  1-{Math.min(filteredProducts.length, 10)} arası gösteriliyor, 
                  toplam {filteredProducts.length} ürün
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    data-testid="button-previous-page"
                  >
                    Önceki
                  </Button>
                  <Button 
                    size="sm"
                    data-testid="button-page-1"
                  >
                    1
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-next-page"
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Edit Modal */}
      {selectedProduct && (
        <StockEditModal
          product={selectedProduct}
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
