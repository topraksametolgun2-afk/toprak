import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Star } from "lucide-react";
import type { ProductWithSeller } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithSeller;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Stokta Yok', variant: 'destructive' as const };
    if (stock <= 10) return { text: 'Az Stok', variant: 'secondary' as const };
    return { text: 'Stokta Var', variant: 'default' as const };
  };

  const stockStatus = getStockStatus(product.stock);
  const rating = parseFloat(product.averageRating || "0");

  return (
    <Card 
      className="product-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"}
          alt={product.name}
          className="w-full h-48 object-cover"
          data-testid={`img-product-${product.id}`}
        />
        {product.stock <= 10 && product.stock > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2"
            data-testid={`badge-low-stock-${product.id}`}
          >
            Az Stok
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 right-2"
            data-testid={`badge-out-of-stock-${product.id}`}
          >
            Stokta Yok
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 
          className="font-semibold text-lg mb-2 line-clamp-2" 
          data-testid={`title-product-${product.id}`}
        >
          {product.name}
        </h3>
        
        <p 
          className="text-muted-foreground text-sm mb-3 line-clamp-2"
          data-testid={`description-product-${product.id}`}
        >
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-2xl font-bold text-primary"
            data-testid={`price-product-${product.id}`}
          >
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Package className="w-4 h-4 text-accent mr-1" />
            <span data-testid={`stock-product-${product.id}`}>
              {product.stock} adet
            </span>
          </div>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground" data-testid={`rating-product-${product.id}`}>
              {rating.toFixed(1)} ({product.reviewCount} değerlendirme)
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <Badge variant="outline" data-testid={`category-product-${product.id}`}>
            {product.category}
          </Badge>
          <span data-testid={`seller-product-${product.id}`}>
            {product.seller.company || `${product.seller.firstName} ${product.seller.lastName}`}
          </span>
        </div>
        
        <Button 
          className="w-full"
          disabled={product.stock === 0}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
        </Button>
      </CardContent>
    </Card>
  );
}
