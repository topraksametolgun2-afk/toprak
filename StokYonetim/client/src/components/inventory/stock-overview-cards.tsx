import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { InventoryStats } from "@shared/schema";

export default function StockOverviewCards() {
  const { data: stats, isLoading } = useQuery<InventoryStats>({
    queryKey: ["/api/inventory/stats"],
  });

  const cards = [
    {
      title: "Toplam Ürün",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "card-total-products"
    },
    {
      title: "Stokta Olan",
      value: stats?.inStock || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      testId: "card-in-stock"
    },
    {
      title: "Kritik Seviye",
      value: stats?.criticalStock || 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      testId: "card-critical-stock"
    },
    {
      title: "Tükenen",
      value: stats?.outOfStock || 0,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-red-100",
      testId: "card-out-of-stock"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} data-testid={card.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold mt-1" data-testid={`text-${card.testId.replace('card-', '')}-value`}>
                    {card.value.toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
