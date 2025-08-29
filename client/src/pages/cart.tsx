import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Package, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItemWithProduct } from "@shared/schema";

export default function Cart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/update/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/remove/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Ürün kaldırıldı",
        description: "Ürün sepetinizden başarıyla kaldırıldı",
      });
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout");
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Sipariş başarılı!",
        description: `Siparişiniz oluşturuldu. Toplam: ${formatPrice(data.total)}`,
      });
      setIsCheckingOut(false);
    },
    onError: () => {
      setIsCheckingOut(false);
    },
  });

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (id: string) => {
    if (window.confirm("Bu ürünü sepetinizden kaldırmak istediğinizden emin misiniz?")) {
      removeItemMutation.mutate(id);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    checkoutMutation.mutate();
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number(price));
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32">
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
    <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sepetim</h1>
            <p className="text-muted-foreground">
              Satın almak istediğiniz ürünleri gözden geçirin
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cart Stats */}
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
                <p className="text-2xl font-bold text-foreground" data-testid="total-items">
                  {getTotalItems()}
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
                <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="total-types">
                  {cartItems?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Farklı Ürün</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary" data-testid="total-price">
                  {formatPrice(calculateTotal())}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cart Items */}
      {!cartItems || cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Sepetiniz boş
          </h3>
          <p className="text-muted-foreground mb-6">
            Alışverişe başlamak için ürünleri sepetinize ekleyin
          </p>
          <Button data-testid="button-continue-shopping">
            <Package className="w-4 h-4 mr-2" />
            Alışverişe Başla
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`item-name-${item.id}`}>
                          {item.product.name}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="text-xs">
                            ID: {item.product.id.slice(0, 8)}...
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Birim: {formatPrice(item.product.price)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            data-testid={`input-quantity-${item.id}`}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-0">
                          <p className="text-lg font-bold text-primary" data-testid={`item-total-${item.id}`}>
                            {formatPrice(Number(item.product.price) * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.product.price)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Checkout Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ürün Sayısı:</span>
                    <span data-testid="summary-item-count">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam:</span>
                    <span data-testid="summary-subtotal">{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo:</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Toplam:</span>
                      <span className="text-primary" data-testid="summary-total">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    100 TL üzeri siparişlerde kargo ücretsiz!
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || checkoutMutation.isPending || cartItems.length === 0}
                  className="w-full"
                  size="lg"
                  data-testid="button-checkout"
                >
                  {isCheckingOut || checkoutMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Sipariş Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Satın Al ({formatPrice(calculateTotal())})
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-continue-shopping"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Alışverişe Devam Et
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </main>
  );
}