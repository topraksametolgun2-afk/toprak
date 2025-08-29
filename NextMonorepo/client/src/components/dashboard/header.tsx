import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface HealthStatus {
  status: string;
  services: {
    database: string;
    server: string;
  };
}

export function Header() {
  const { data: healthData, isLoading } = useQuery<HealthStatus>({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isHealthy = healthData?.status === "healthy";

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-lg">⚡</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
                TypeScript Monorepo
              </h1>
            </div>
            <span className="text-sm text-muted-foreground">Geliştirme Paneli</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Health Status Indicator */}
            <div className="flex items-center space-x-2" data-testid="health-status">
              <div className={`status-indicator ${isHealthy ? 'status-online' : 'status-offline'}`}>
                <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-success' : 'bg-destructive'} ${isLoading ? 'pulse-animation' : ''}`}></div>
              </div>
              <span className={`text-sm font-medium ${isHealthy ? 'text-success' : 'text-destructive'}`}>
                {isLoading ? 'Kontrol Ediliyor...' : isHealthy ? 'Sistem Sağlıklı' : 'Sistem Hatası'}
              </span>
            </div>
            
            {/* Environment Badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Geliştirme
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
