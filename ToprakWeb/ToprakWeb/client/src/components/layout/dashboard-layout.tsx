import { Sidebar } from "./sidebar";
import { Search, Bell, Moon } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" data-testid="dashboard-layout">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">{title}</h2>
              {subtitle && (
                <p className="text-muted-foreground" data-testid="page-subtitle">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input 
                  type="search" 
                  placeholder="Ara..." 
                  className="w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
              
              {/* Notifications */}
              <button 
                className="relative p-2 text-muted-foreground hover:text-foreground"
                data-testid="notifications-button"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </button>
              
              {/* Theme Toggle */}
              <button 
                className="p-2 text-muted-foreground hover:text-foreground"
                data-testid="theme-toggle"
              >
                <Moon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
