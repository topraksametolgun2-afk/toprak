import { Header } from "@/components/dashboard/header";
import { ServerStatusCard } from "@/components/dashboard/server-status-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { EnvironmentCard } from "@/components/dashboard/environment-card";
import { UserManagementCard } from "@/components/dashboard/user-management-card";
import { ApiEndpointsCard } from "@/components/dashboard/api-endpoints-card";
import { DevelopmentCommands } from "@/components/dashboard/development-commands";
import { Footer } from "@/components/dashboard/footer";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm">🚀</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Monorepo'nuza Hoş Geldiniz</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              React frontend + Express.js backend ile Supabase PostgreSQL ve Drizzle ORM
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/20 text-primary font-medium">
                TypeScript
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success/20 text-success font-medium">
                React 18
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning/20 text-warning font-medium">
                Express.js
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-destructive/20 text-destructive font-medium">
                Supabase
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ServerStatusCard />
          <QuickActionsCard />
          <EnvironmentCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserManagementCard />
          <ApiEndpointsCard />
        </div>

        <DevelopmentCommands />
      </main>

      <Footer />
    </div>
  );
}
