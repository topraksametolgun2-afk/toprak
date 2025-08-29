import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { ProductWithInventory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: products, isLoading } = useQuery<ProductWithInventory[]>({
    queryKey: ["/api/inventory"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">E-Ticaret Platform</h1>
            <p className="text-muted-foreground mb-8">Ürünlerinizi keşfedin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Destek Merkezi</h1>
            <div className="flex items-center gap-3">
              <Link href="/siparislerim">
                <Button variant="outline" data-testid="button-orders">
                  Siparişlerim
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" data-testid="button-admin">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">E-Ticaret Platformuna Hoş Geldiniz</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Geniş ürün yelpazemizi keşfedin ve güvenle alışveriş yapın
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-bold mb-8">Ürünlerimiz</h3>
          
          {!products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz ürün bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
                  <div className="aspect-square bg-muted relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Resim Yok
                      </div>
                    )}
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-2 right-2">
                      {product.inventory.currentStock === 0 ? (
                        <Badge variant="destructive" data-testid={`badge-outofstock-${product.id}`}>
                          Tükendi
                        </Badge>
                      ) : product.inventory.currentStock <= product.inventory.criticalLevel ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid={`badge-critical-${product.id}`}>
                          Son {product.inventory.currentStock} adet
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid={`badge-instock-${product.id}`}>
                          Stokta {product.inventory.currentStock} adet
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 line-clamp-2" data-testid={`text-productname-${product.id}`}>
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold mb-3" data-testid={`text-price-${product.id}`}>
                      ₺{parseFloat(product.price).toLocaleString('tr-TR')}
                    </p>
                    
                    <div className="flex gap-2">
                      <Link href={`/product/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" data-testid={`button-details-${product.id}`}>
                          Detaylar
                        </Button>
                      </Link>
                      <Button 
                        className="flex-1" 
                        disabled={product.inventory.currentStock === 0}
                        data-testid={`button-addtocart-${product.id}`}
                      >
                        {product.inventory.currentStock === 0 ? "Tükendi" : "Sepete Ekle"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
