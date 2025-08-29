import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import type { ProductWithInventory } from "@shared/schema";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const productId = params?.id;

  const { data: product, isLoading, error } = useQuery<ProductWithInventory>({
    queryKey: ["/api/inventory", productId],
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6 w-32"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h1>
              <p className="text-muted-foreground">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stockStatus = 
    product.inventory.currentStock === 0 ? "out_of_stock" :
    product.inventory.currentStock <= product.inventory.criticalLevel ? "critical" : "in_stock";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ürünlere Dön
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-20 h-20" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-productname">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4" data-testid="text-sku">
                SKU: {product.sku}
              </p>
              
              {product.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.category.name}
                </Badge>
              )}
            </div>

            <div className="text-3xl font-bold text-primary" data-testid="text-price">
              ₺{parseFloat(product.price).toLocaleString('tr-TR')}
            </div>

            {/* Stock Information */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Stok Durumu</h3>
                  {stockStatus === "out_of_stock" ? (
                    <Badge variant="destructive" data-testid="badge-stockstatus">
                      Tükendi
                    </Badge>
                  ) : stockStatus === "critical" ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid="badge-stockstatus">
                      Kritik Seviye
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid="badge-stockstatus">
                      Stokta Var
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mevcut Stok:</span>
                    <span className="font-medium" data-testid="text-currentstock">
                      {product.inventory.currentStock} adet
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kritik Seviye:</span>
                    <span className="font-medium">
                      {product.inventory.criticalLevel} adet
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Son Güncelleme:</span>
                    <span className="font-medium">
                      {product.inventory.lastUpdated ? new Date(product.inventory.lastUpdated).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Ürün Açıklaması</h3>
                <p className="text-muted-foreground" data-testid="text-description">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full"
                disabled={product.inventory.currentStock === 0}
                data-testid="button-addtocart"
              >
                {product.inventory.currentStock === 0 ? "Stokta Yok" : "Sepete Ekle"}
              </Button>
              
              {stockStatus === "critical" && (
                <p className="text-sm text-amber-600 text-center" data-testid="text-stockwarning">
                  ⚠️ Bu üründen sadece {product.inventory.currentStock} adet kaldı!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
