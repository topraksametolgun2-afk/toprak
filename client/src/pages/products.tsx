import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Search, ShoppingCart, Package, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/favorites/add", { productId });
    },
    onSuccess: (_, productId) => {
      setFavoriteStates(prev => ({ ...prev, [productId]: true }));
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/favorites/remove/${productId}`);
    },
    onSuccess: (_, productId) => {
      setFavoriteStates(prev => ({ ...prev, [productId]: false }));
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart/add", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Check if product is favorite on load
  const checkFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/favorites/check/${productId}`, {
        credentials: "include",
      });
      const data = await response.json();
      return { productId, isFavorite: data.isFavorite };
    },
    onSuccess: (data) => {
      setFavoriteStates(prev => ({ ...prev, [data.productId]: data.isFavorite }));
    },
  });

  // Check favorites on products load
  useState(() => {
    if (products) {
      products.forEach(product => {
        if (!(product.id in favoriteStates)) {
          checkFavoriteMutation.mutate(product.id);
        }
      });
    }
  });

  const handleToggleFavorite = (productId: string) => {
    const isFavorite = favoriteStates[productId];
    if (isFavorite) {
      removeFavoriteMutation.mutate(productId);
    } else {
      addFavoriteMutation.mutate(productId);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number(price));
  };

  // Filter products based on search
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-80">
              <CardContent className="p-6">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ürünler</h1>
            <p className="text-muted-foreground">
              Tüm ürünleri inceleyin ve favorilerinize ekleyin
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
          <Button variant="outline" data-testid="button-filters">
            <Filter className="w-4 h-4 mr-2" />
            Filtreler
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="total-products">
                  {products?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Ürün</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="filtered-products">
                  {filteredProducts.length}
                </p>
                <p className="text-sm text-muted-foreground">Gösterilen Ürün</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="favorite-products">
                  {Object.values(favoriteStates).filter(Boolean).length}
                </p>
                <p className="text-sm text-muted-foreground">Favori Ürün</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? "Ürün bulunamadı" : "Henüz ürün yok"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? `"${searchTerm}" için ürün bulunamadı. Farklı bir arama yapmayı deneyin.`
              : "Henüz sisteme ürün eklenmemiş."
            }
          </p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm("")} data-testid="button-clear-search">
              Aramayı Temizle
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.02 }}
              whileHover={{ y: -4 }}
              className="transition-all duration-300"
            >
              <Card className="h-full hover:shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 flex-1" data-testid={`product-name-${product.id}`}>
                      {product.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(product.id)}
                      disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                      className={`ml-2 transition-all duration-200 ${
                        favoriteStates[product.id]
                          ? "text-red-500 hover:text-red-700"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                      data-testid={`button-toggle-favorite-${product.id}`}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-all duration-200 ${
                          favoriteStates[product.id] ? "fill-current" : ""
                        }`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        ID: {product.id.slice(0, 8)}...
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary mb-1" data-testid={`product-price-${product.id}`}>
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Eklendi: {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => addToCartMutation.mutate(product.id)}
                        disabled={addToCartMutation.isPending}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        {addToCartMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            Ekleniyor...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Sepete Ekle
                          </>
                        )}
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-view-details-${product.id}`}
                        >
                          Detay
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-add-to-list-${product.id}`}
                        >
                          Listeye Ekle
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}