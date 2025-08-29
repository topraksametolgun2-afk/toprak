import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, MessageSquare, Download, RotateCcw } from "lucide-react";
import { SalesTrendChart } from "@/components/charts/sales-trend-chart";
import { OrderStatusChart } from "@/components/charts/order-status-chart";
import { MessageTrafficChart } from "@/components/charts/message-traffic-chart";
import { UserRegistrationChart } from "@/components/charts/user-registration-chart";
import { AccessDenied } from "@/components/access-denied";
import type { ReportMetrics, AuthUser, SalesData, OrderStatusData, MessageTrafficData, UserRegistrationData } from "@shared/schema";

export default function Reports() {
  const [dateRange, setDateRange] = useState("last-3-months");
  const [orderStatus, setOrderStatus] = useState("all");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  // Check user role
  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
  });

  // Build query params
  const getQueryParams = () => {
    const params = new URLSearchParams();
    
    if (dateRange !== "custom") {
      const now = new Date();
      let start: Date;
      
      switch (dateRange) {
        case "last-7-days":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "last-30-days":
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last-3-months":
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "this-year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return params;
      }
      
      params.set("startDate", start.toISOString().split("T")[0]);
      params.set("endDate", now.toISOString().split("T")[0]);
    } else {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }
    
    if (orderStatus !== "all") {
      params.set("status", orderStatus);
    }
    
    return params;
  };

  const queryParams = getQueryParams().toString();

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useQuery<ReportMetrics>({
    queryKey: ["/api/reports/metrics", queryParams],
    enabled: user?.role === "toptancı",
  });

  const { data: salesData, isLoading: salesLoading } = useQuery<SalesData[]>({
    queryKey: ["/api/reports/sales", queryParams],
    enabled: user?.role === "toptancı",
  });

  const { data: orderStatusData, isLoading: ordersLoading } = useQuery<OrderStatusData[]>({
    queryKey: ["/api/reports/orders", queryParams], 
    enabled: user?.role === "toptancı",
  });

  const { data: messageData, isLoading: messagesLoading } = useQuery<MessageTrafficData[]>({
    queryKey: ["/api/reports/messages", queryParams],
    enabled: user?.role === "toptancı",
  });

  const { data: userData, isLoading: usersLoading } = useQuery<UserRegistrationData[]>({
    queryKey: ["/api/reports/users", queryParams],
    enabled: user?.role === "toptancı",
  });

  // Role-based access control
  if (user && user.role !== "toptancı") {
    return <AccessDenied />;
  }

  const handleApplyFilters = () => {
    // Trigger refetch by updating query params
    window.location.reload();
  };

  const handleResetFilters = () => {
    setDateRange("last-3-months");
    setOrderStatus("all");
    setStartDate("2024-01-01");
    setEndDate("2024-12-31");
  };

  const handleDownloadReport = () => {
    // TODO: Implement report download
    console.log("Rapor indiriliyor...");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? "text-green-600" : "text-red-600";
    
    return (
      <div className={`flex items-center text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {Math.abs(growth).toFixed(1)}% geçen aya göre
      </div>
    );
  };

  const metricCards = [
    {
      title: "Toplam Satış",
      value: formatCurrency(metrics?.totalSales || 0),
      growth: metrics?.salesGrowth || 0,
      icon: DollarSign,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Toplam Sipariş", 
      value: (metrics?.totalOrders || 0).toLocaleString("tr-TR"),
      growth: metrics?.ordersGrowth || 0,
      icon: ShoppingBag,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Aktif Kullanıcı",
      value: (metrics?.activeUsers || 0).toLocaleString("tr-TR"),
      growth: metrics?.usersGrowth || 0,
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Toplam Mesaj",
      value: (metrics?.totalMessages || 0).toLocaleString("tr-TR"),
      growth: metrics?.messagesGrowth || 0,
      icon: MessageSquare,
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Raporlar ve Analitik</h1>
        <p className="mt-2 text-muted-foreground">İş performansınızı analiz edin ve trendleri takip edin</p>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Tarih Aralığı</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Son 7 Gün</SelectItem>
                    <SelectItem value="last-30-days">Son 30 Gün</SelectItem>
                    <SelectItem value="last-3-months">Son 3 Ay</SelectItem>
                    <SelectItem value="this-year">Bu Yıl</SelectItem>
                    <SelectItem value="all-time">Tüm Zamanlar</SelectItem>
                    <SelectItem value="custom">Özel Aralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Status Filter */}
              <div className="space-y-2">
                <Label>Sipariş Durumu</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger data-testid="select-order-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="beklemede">Beklemede</SelectItem>
                    <SelectItem value="onaylandı">Onaylandı</SelectItem>
                    <SelectItem value="kargoda">Kargoda</SelectItem>
                    <SelectItem value="teslim_edildi">Teslim Edildi</SelectItem>
                    <SelectItem value="iptal_edildi">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {dateRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label>Başlangıç Tarihi</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bitiş Tarihi</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      data-testid="input-end-date"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleApplyFilters} data-testid="button-apply-filters">
                Filtreleri Uygula
              </Button>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                data-testid="button-reset-filters"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownloadReport}
                data-testid="button-download-report"
              >
                <Download className="w-4 h-4 mr-2" />
                Raporu İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -2 }}
            className="transition-all duration-300"
          >
            <Card className="hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {metricsLoading ? "..." : metric.value}
                    </p>
                    {!metricsLoading && (
                      <div className="mt-1">
                        {formatGrowth(metric.growth)}
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${metric.color}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Satış Trendi</CardTitle>
              <p className="text-sm text-muted-foreground">Günlük satış performansı</p>
            </CardHeader>
            <CardContent>
              <SalesTrendChart data={salesData} isLoading={salesLoading} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Sipariş Durumu Dağılımı</CardTitle>
              <p className="text-sm text-muted-foreground">Mevcut sipariş durumlarının yüzdelik dağılımı</p>
            </CardHeader>
            <CardContent>
              <OrderStatusChart data={orderStatusData} isLoading={ordersLoading} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Full Width Charts */}
      <div className="space-y-8">
        {/* Message Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Mesaj Trafiği</CardTitle>
              <p className="text-sm text-muted-foreground">Günlük mesaj sayıları ve trendler</p>
            </CardHeader>
            <CardContent>
              <MessageTrafficChart data={messageData} isLoading={messagesLoading} />
            </CardContent>
          </Card>
        </motion.div>

        {/* User Registration Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Kullanıcı Kayıt Trendi</CardTitle>
              <p className="text-sm text-muted-foreground">Yeni kullanıcı kayıtları ve büyüme oranları</p>
            </CardHeader>
            <CardContent>
              <UserRegistrationChart data={userData} isLoading={usersLoading} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
