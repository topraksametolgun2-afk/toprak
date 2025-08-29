import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import { StarRating } from "@/components/reviews/star-rating";
import { Package, Eye, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/products");
      return response.json() as Promise<Product[]>;
    },
  });

  // Mock current user ID - in real app this would come from auth context
  const currentUserId = "user-123";

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <Navbar />
          <main className="flex-1 p-6" data-testid="product-detail-page">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                  data-testid="back-to-products"
                >
                  ← Ürünlere Geri Dön
                </Button>
                <h1 className="text-2xl font-bold">Ürün Detayı</h1>
              </div>

              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedProduct.name}</span>
                    <Badge variant="outline">
                      ${selectedProduct.price}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        {selectedProduct.description || "Bu ürün için açıklama bulunmamaktadır."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Kategori: Genel</Badge>
                        <Badge variant="outline">Stok: {selectedProduct.stock}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <ProductReviewsSection
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                currentUserId={currentUserId}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <main className="flex-1 p-6" data-testid="products-page">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Ürünler</h1>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500" data-testid="no-products">
                    Henüz ürün bulunmamaktadır.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

function ProductCard({ product, onSelect }: ProductCardProps) {
  const { data: ratingData } = useQuery({
    queryKey: ["/api/reviews/product", product.id, "average"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/reviews/product/${product.id}/average`);
      return response.json() as Promise<{ average: number }>;
    },
  });

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(product)}
      data-testid={`product-card-${product.id}`}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-1" data-testid={`product-name-${product.id}`}>
              {product.name}
            </h3>
            
            {ratingData && ratingData.average > 0 && (
              <StarRating 
                rating={ratingData.average} 
                readonly 
                size="sm" 
                data-testid={`product-rating-${product.id}`}
              />
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-600" data-testid={`product-price-${product.id}`}>
                ${product.price}
              </span>
              <Badge variant="outline">
                Stok: {product.stock}
              </Badge>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              data-testid={`view-product-${product.id}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Detayları Gör
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}