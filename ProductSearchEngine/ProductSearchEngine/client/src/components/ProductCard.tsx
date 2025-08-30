import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleCardClick = () => {
    // TODO: Navigate to product detail page
    console.log('Navigate to product detail:', product.id);
  };

  const formatPrice = (price: string) => {
    return `₺${parseFloat(price).toLocaleString('tr-TR')}`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { label: 'Tükendi', className: 'text-red-600 bg-red-50' };
    } else if (product.stock <= 5) {
      return { label: `${product.stock} Kaldı`, className: 'text-orange-600 bg-orange-50' };
    }
    return { label: 'Stokta', className: 'text-green-600 bg-green-50' };
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg"
      onClick={handleCardClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-48 object-cover"
          data-testid={`img-product-${product.id}`}
        />
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 p-1 h-8 w-8 rounded-full bg-white/80 hover:bg-white ${
            isWishlisted ? 'text-red-500' : 'text-muted-foreground'
          }`}
          onClick={handleWishlistToggle}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${product.id}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
        </div>
        
        <h3 
          className="font-semibold text-foreground mb-2 line-clamp-2" 
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-sm mr-2">
            {renderStars(Math.round(parseFloat(product.averageRating || '0')))}
          </div>
          <span className="text-sm text-muted-foreground" data-testid={`text-rating-${product.id}`}>
            {parseFloat(product.averageRating || '0').toFixed(1)} ({product.reviewCount})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className="text-lg font-bold text-primary" 
              data-testid={`text-price-${product.id}`}
            >
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
              <span 
                className="text-sm text-muted-foreground line-through"
                data-testid={`text-original-price-${product.id}`}
              >
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${stockStatus.className}`}
            data-testid={`badge-stock-${product.id}`}
          >
            {stockStatus.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
