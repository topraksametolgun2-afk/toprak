import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, RotateCcw } from "lucide-react";
import type { StockMovementWithProduct } from "@shared/schema";

export default function StockMovementHistory() {
  const { data: movements = [], isLoading } = useQuery<StockMovementWithProduct[]>({
    queryKey: ["/api/inventory/movements"],
  });

  const getMovementIcon = (type: string, reason: string) => {
    switch (type) {
      case "in":
        return {
          icon: Plus,
          className: "w-5 h-5 text-green-600",
          bgColor: "bg-green-100"
        };
      case "out":
        return {
          icon: Minus,
          className: "w-5 h-5 text-red-600",
          bgColor: "bg-red-100"
        };
      case "adjustment":
        return {
          icon: RotateCcw,
          className: "w-5 h-5 text-amber-600",
          bgColor: "bg-amber-100"
        };
      default:
        return {
          icon: RotateCcw,
          className: "w-5 h-5 text-gray-600",
          bgColor: "bg-gray-100"
        };
    }
  };

  const getMovementDescription = (movement: StockMovementWithProduct) => {
    const quantityText = movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity.toString();
    
    switch (movement.reason) {
      case "purchase":
        return `${quantityText} adet eklendi • Satın Alma`;
      case "sale":
        return `${quantityText} adet • ${movement.orderId ? `Sipariş #${movement.orderId}` : "Satış"}`;
      case "adjustment":
        return `${movement.notes || "Stok düzeltmesi"} • Manuel Düzeltme`;
      case "return":
        return `${quantityText} adet • İade`;
      default:
        return `${quantityText} adet • ${movement.reason}`;
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Son Stok Hareketleri</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Henüz stok hareketi bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => {
              const iconConfig = getMovementIcon(movement.type, movement.reason);
              const IconComponent = iconConfig.icon;
              
              return (
                <div 
                  key={movement.id} 
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  data-testid={`item-movement-${movement.id}`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${iconConfig.bgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className={iconConfig.className} />
                    </div>
                    <div className="ml-4">
                      <p 
                        className="text-sm font-medium"
                        data-testid={`text-movement-product-${movement.id}`}
                      >
                        {movement.product.name} - {
                          movement.type === "in" ? "Stok Eklendi" :
                          movement.type === "out" ? "Sipariş" :
                          "Stok Düzeltmesi"
                        }
                      </p>
                      <p 
                        className="text-xs text-muted-foreground"
                        data-testid={`text-movement-details-${movement.id}`}
                      >
                        {getMovementDescription(movement)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p 
                      className="text-sm font-medium"
                      data-testid={`text-movement-time-${movement.id}`}
                    >
                      {movement.createdAt ? formatTimeAgo(new Date(movement.createdAt)) : 'Bilinmiyor'}
                    </p>
                    <p 
                      className="text-xs text-muted-foreground"
                      data-testid={`text-movement-user-${movement.id}`}
                    >
                      {movement.user?.username || "Sistem"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
