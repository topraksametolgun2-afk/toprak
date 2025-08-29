import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import type { InventoryStats } from "@shared/schema";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<InventoryStats>({
    queryKey: ["/api/inventory/stats"],
  });

  const dashboardCards = [
    {
      title: "Toplam Ürün",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Stokta Olan",
      value: stats?.inStock || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Kritik Seviye",
      value: stats?.criticalStock || 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Tükenen",
      value: stats?.outOfStock || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const menuItems = [
    {
      title: "Stok Yönetimi",
      description: "Ürün stoklarını görüntüle ve yönet",
      href: "/admin/inventory",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Siparişler",
      description: "Müşteri siparişlerini takip et",
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "text-green-600", 
      bgColor: "bg-green-100",
    },
    {
      title: "Müşteriler",
      description: "Müşteri hesaplarını yönet",
      href: "/admin/customers",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Raporlar",
      description: "Satış ve stok raporları",
      href: "/admin/reports",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
          <p className="text-muted-foreground">
            E-ticaret platformunuzu yönetin ve izleyin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <Card key={card.title} data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? (
                        <div className="h-8 w-12 bg-muted rounded animate-pulse"></div>
                      ) : (
                        <span data-testid={`text-${card.title.toLowerCase().replace(/\s+/g, '-')}-count`}>
                          {card.value}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${item.bgColor}`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Yeni ürün eklendi: Samsung Galaxy S24</span>
                </div>
                <span className="text-xs text-muted-foreground">2 saat önce</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Kritik stok uyarısı: MacBook Pro 14"</span>
                </div>
                <span className="text-xs text-muted-foreground">4 saat önce</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Stok tükendi: Sony WH-1000XM5</span>
                </div>
                <span className="text-xs text-muted-foreground">1 gün önce</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
