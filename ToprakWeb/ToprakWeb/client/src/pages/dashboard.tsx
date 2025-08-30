import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TicketTable } from "@/components/dashboard/ticket-table";
import { Ticket, Users, Package, CheckCircle, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Hoş geldiniz, sisteminizin genel durumunu görüntüleyin"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Toplam Ticket"
            value={isLoading ? "..." : stats?.totalTickets || 0}
            icon={<Ticket className="text-primary" />}
            trend={{
              value: "+12%",
              isPositive: true,
              period: "geçen aydan"
            }}
            iconBgColor="bg-primary/10"
          />
          
          <StatsCard
            title="Aktif Kullanıcılar"
            value={isLoading ? "..." : stats?.activeUsers || 0}
            icon={<Users className="text-green-500" />}
            trend={{
              value: "+8%",
              isPositive: true,
              period: "geçen aydan"
            }}
            iconBgColor="bg-green-500/10"
          />
          
          <StatsCard
            title="Stok Durumu"
            value={isLoading ? "..." : stats?.stockItems || 0}
            icon={<Package className="text-orange-500" />}
            trend={{
              value: "-3%",
              isPositive: false,
              period: "geçen aydan"
            }}
            iconBgColor="bg-orange-500/10"
          />
          
          <StatsCard
            title="Çözülen Ticket"
            value={isLoading ? "..." : stats?.resolvedTickets || 0}
            icon={<CheckCircle className="text-blue-500" />}
            trend={{
              value: "+15%",
              isPositive: true,
              period: "geçen aydan"
            }}
            iconBgColor="bg-blue-500/10"
          />
        </div>
        
        {/* Charts and Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <div className="bg-card p-6 rounded-lg border border-border" data-testid="chart-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Ticket Trendi</h3>
              <select className="text-sm border border-border rounded-md px-3 py-1 bg-background" data-testid="chart-period-select">
                <option>Son 7 gün</option>
                <option>Son 30 gün</option>
                <option>Son 90 gün</option>
              </select>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center" data-testid="chart-placeholder">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                <p className="text-muted-foreground">Chart Component</p>
              </div>
            </div>
          </div>
          
          {/* Activities */}
          <ActivityFeed />
        </div>
        
        {/* Data Table */}
        <TicketTable />
      </div>
    </DashboardLayout>
  );
}
