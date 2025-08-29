import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentUsersTable } from "@/components/dashboard/recent-users-table";
import { SystemStatus } from "@/components/dashboard/system-status";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="page-dashboard">
      <Header 
        title="Ana Sayfa" 
        description="Hoş geldiniz! Sistem durumunuzu ve son aktivitelerinizi görüntüleyin."
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentUsersTable />
          <SystemStatus />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </main>
    </div>
  );
}
