import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash2, ShoppingCart, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { FavoriteWithProduct } from "@shared/schema";

export default function Favorites() {
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites, isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ["/api/favorites"],
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/favorites/remove/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleRemoveFavorite = (productId: string) => {
    removeFavoriteMutation.mutate(productId);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number(price));
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
        <div className="flex items-center space-x-3 mb-2">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold text-foreground">Favorilerim</h1>
        </div>
        <p className="text-muted-foreground">
          Beğendiğiniz ürünleri buradan takip edebilirsiniz
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="favorites-count">
                  {favorites?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Favori Ürün</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Favorites Grid */}
      {!favorites || favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Henüz favori ürününüz yok
          </h3>
          <p className="text-muted-foreground mb-6">
            Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz
          </p>
          <Button data-testid="button-browse-products">
            <Package className="w-4 h-4 mr-2" />
            Ürünleri İncele
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite, index) => (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className="transition-all duration-300"
            >
              <Card className="h-full hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2" data-testid={`product-name-${favorite.product.id}`}>
                      {favorite.product.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.product.id)}
                      disabled={removeFavoriteMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      data-testid={`button-remove-favorite-${favorite.product.id}`}
                    >
                      {removeFavoriteMutation.isPending ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Ürün ID: {favorite.product.id.slice(0, 8)}...
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(favorite.createdAt).toLocaleDateString('tr-TR')}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary" data-testid={`product-price-${favorite.product.id}`}>
                        {formatPrice(favorite.product.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Favorilere eklendi: {new Date(favorite.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        data-testid={`button-add-to-cart-${favorite.product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Sepete Ekle
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-view-product-${favorite.product.id}`}
                      >
                        Detay
                      </Button>
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